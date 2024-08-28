import { Mina, PublicKey, UInt32,Field,  ZkProgram, Bytes, Hash, state, Bool, verify, Struct, Provable, UInt8} from 'o1js';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
import * as secp256k1Noble from '@noble/curves/secp256k1';
import { sha256} from '@noble/hashes/sha2';
// import { proveableECDSA } from './proveableECDSAmina'
import { proveableECDSAreturnR } from './proveableECDSA'

class ECDSAHelper extends Struct({
    messageHash: Field,
    r: Field,
    s: Field
}){}

class ECDSAHelperNonField extends Struct({
  messageHash: BigInt,
  r: BigInt,
  s: BigInt
}){}

class PublicArgumets extends Struct({
    commitment: Field,
    dataField:Field
  }){}

// const checkECDSA = async (e:Field,s:Field,r:Field): Promise<Bool> => {
//   const publicKey = {
//     x:Field(59584560953242332934734563514771605484743832818030684748574986816321863477095n),
//     y:Field(35772424464574968427090264313855970786042086272413829287792016132157953251778n)
//   }
//   const result = await proveableECDSA(e ,s, r, publicKey.x,publicKey.y);
//   return new Bool(result)
// }

const checkECDSAnonField = async (e:bigint,s:bigint,r:bigint): Promise<bigint> => {
  const publicKey = {
    x:BigInt(59584560953242332934734563514771605484743832818030684748574986816321863477095n),
    y:BigInt(35772424464574968427090264313855970786042086272413829287792016132157953251778n)
  }

  const result = await proveableECDSAreturnR(e ,s, r, publicKey.x,publicKey.y);
  //const result = true;
  return result
}

const ZkonZkProgramECDSA = ZkProgram({
    name:'zkon-proof',
    publicInput: PublicArgumets,
  
    methods:{
      verifySourceNonField:{
        privateInputs: [Field, ECDSAHelperNonField], 
        async method (
          commitment: PublicArgumets,
          decommitment: Field,
          ECDSASign:ECDSAHelperNonField,
        ){
            //Provable.log(ECDSAHelper);
            const assert = Bool(true);
            const publicKey = {
                x:59584560953242332934734563514771605484743832818030684748574986816321863477095n,
                y:35772424464574968427090264313855970786042086272413829287792016132157953251778n
            }
            Provable.log("Inside zkProgram:",ECDSASign.messageHash)
            const checkECDSASignature: bigint = await checkECDSAnonField(ECDSASign.messageHash, ECDSASign.s, ECDSASign.r);
            Provable.log("ECDSA Validation Inside zkProgram", checkECDSASignature);

            const Recovery_xAffine = Field(checkECDSASignature);
            Recovery_xAffine.assertEquals(Field(ECDSASign.r),"Recovery Point x-affine not same as Signature-R, Invalid ECDSA Signature.");

            //assert.assertEquals(checkECDSASignature, "zkAssertion fails?");
      
            decommitment.assertEquals(commitment.commitment);
        }
      }
    }
  });
  
  export {ZkonZkProgramECDSA , PublicArgumets, ECDSAHelper,ECDSAHelperNonField};
