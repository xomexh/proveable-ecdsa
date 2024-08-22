import { Mina, PublicKey, PrivateKey, Field, Bytes, Hash, verify,fetchEvents,fetchAccount, UInt8, ZkProgram, Provable} from 'o1js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { ZkonZkProgramECDSA, PublicArgumets, ECDSAHelper} from './zkProgram'

const zkProgramTest = async () => {
    //Expected e-> hash(message) -> 71434212616171258881167833273589199798160798266365951356480825534922218147392n
    const e = 71434212616171258881167833273589199798160798266365951356480825534922218147392n
    const r = 81447002185398275822095816021075624568224161238760933553486802907392490238292n
    const s = 7946449788279160792259694071968415267819694180200632783208719855055985626056n

    const ecdsaData = new ECDSAHelper({
        messageHash:e,
        r:r,
        s:s
    })

    const publicArgumet = new PublicArgumets({
        commitment:Field(0n),
        dataField:Field(0n)
    })

    const zkp = await ZkonZkProgramECDSA.compile();
    const proof = await ZkonZkProgramECDSA.verifySource(publicArgumet, Field(0n), ecdsaData);
    const resultZk = await verify(proof.toJSON(), zkp.verificationKey);

    console.log("Is zkProof valid?", resultZk);
}

zkProgramTest();
