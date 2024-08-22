import { Mina, PublicKey, UInt32,Field,  ZkProgram, Bytes, Hash, state, Bool, verify, Struct, Provable, UInt8} from 'o1js';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
import * as secp256k1Noble from '@noble/curves/secp256k1';
import { sha256} from '@noble/hashes/sha2';
import { proveableECDSA, publicKeyToCompressed} from './proveableECDSA'

class ECDSAHelper extends Struct({
    messageHash: BigInt,
    r: BigInt,
    s: BigInt
}){}

class PublicArgumets extends Struct({
    commitment: Field,
    dataField:Field
  }){}

const checkECDSA = async (e:bigint,s:bigint,r:bigint): Promise<Bool> => {
  const publicKey = {
    x:59584560953242332934734563514771605484743832818030684748574986816321863477095n,
    y:35772424464574968427090264313855970786042086272413829287792016132157953251778n
  }
  const result = await proveableECDSA(e ,s, r,publicKey.x,publicKey.y);
  return new Bool(result)
}

const ZkonZkProgramECDSA = ZkProgram({
    name:'zkon-proof',
    publicInput: PublicArgumets,
  
    methods:{
      verifySource:{
        privateInputs: [Field, ECDSAHelper], 
        async method (
          commitment: PublicArgumets,
          decommitment: Field,
          ECDSASign:ECDSAHelper,
        ){
            Provable.log(ECDSAHelper);
            const assert = Bool(true);
            const publicKey = {
                x:59584560953242332934734563514771605484743832818030684748574986816321863477095n,
                y:35772424464574968427090264313855970786042086272413829287792016132157953251778n
            }
            Provable.log("Inside zkProgram:",ECDSASign.messageHash)
            const checkECDSASignature: Bool = await checkECDSA(ECDSASign.messageHash.valueOf(), ECDSASign.s.valueOf(), ECDSASign.r.valueOf());
            Provable.log("ECDSA Validation Inside zkProgram", checkECDSASignature);
            //assert.assertEquals(checkECDSASignature, "zkAssertion fails?");
      
            decommitment.assertEquals(commitment.commitment);
        }
      }
    }
  });
  
  export {ZkonZkProgramECDSA , PublicArgumets, ECDSAHelper};
