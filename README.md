# ECDSA Signature verification using o1js.

Pure implementaion of ECDSA using only Bigint type. 

# Library Description.

The file [proveableECDSA.ts](./src/proveableECDSA.ts) is the file in which all the logic & modular arithemetic for ECDSA Verification takes place. 
The function `proveableECDSA(...):<Promise:Bool>` is the function which recives the data for the verification of a valid Signature. 

Tests for modular arithetmics function can be logged by line 225 in [proveableECDSA.ts](./src/proveableECDSA.ts) file. 

# Problem Description.

On running the [index.ts](./src/index.ts) file, when the zkProgram has the line `assert.assertEquals(checkECDSASignature, "zkAssertion fails?");`, the zkProof generation fails with error given below,

```
workspace_root/src/bindings/ocaml/overrides.js:45
    if (err instanceof Error) throw err;
                              ^
Error: zkAssertion fails?
Bool.assertEquals(): true != false
    at Bool.assertEquals (o1js/src/lib/provable/bool.ts:118:17)
    at method (/Users/soms/zk development/proveableECDSA/src/zkProgram.ts:48:20)
    at Object.constraintSystem (o1js/src/lib/provable/core/provable-context.ts:106:5)
    at analyzeMethods (o1js/src/lib/proof-system/zkprogram.ts:483:45)
    at Object.compile (o1js/src/lib/proof-system/zkprogram.ts:508:23)
    at zkProgramTest (/Users/soms/zk development/proveableECDSA/src/index.ts:22:17)

Node.js v21.7.3
```

However, keeping everything as-is, and only commenting out the `assert.assertEquals(checkECDSASignature, "zkAssertion fails?")` in [zkProgram](./src/zkProgram.ts). The program gets a valid output displayed on the console.

```
Inside zkProgram: 71434212616171258881167833273589199798160798266365951356480825534922218147392n
Inside Function : 71434212616171258881167833273589199798160798266365951356480825534922218147392n
Associative property passed.
Commutative property passed.
Identity element passed.
Inverse element passed
Distributivity passed
Scalar multiplication passed
Point doubling passed
Point on curve.
Recovery Point: [
  81447002185398275822095816021075624568224161238760933553486802907392490238292n,
  79251957975174006497705210761697663656081261537861932960031456609646353308556n
]
Siganture recieved: {
  r: 81447002185398275822095816021075624568224161238760933553486802907392490238292n,
  s: 7946449788279160792259694071968415267819694180200632783208719855055985626056n
}
X-affine of RecoveryPoint R == r of signature. Hence valid signature.
Signature is valid.
ECDSA Validation Inside zkProgram true
Is zkProof valid? true
```

To verify if the test paramters are valid, once can run `npx tsx src/proveableECDSA.ts`, and it runs a function to test only the ecdsa-verification function. Feel free to modify these accoriding to your own free will. 

For the value of e,if message is in plain-text, remember to `bytesToHex(sha256(hexToBytes(message)))`, or use the method `verifyECDSA2(...): Promise<boolean>`.

# How to run?

To run the sample code, which invokes a zkProgram with test-vector values for Signatyre {r,s}, hash(message), & PublicKey{x,y}, you can do `npx tsx src/index.ts`.

[Apache-2.0](LICENSE)
