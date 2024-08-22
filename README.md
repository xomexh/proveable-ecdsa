# ECDSA Signature verification using o1js.

Pure implementaion of ECDSA using only Bigint type. 

# Library Description

The file [proveableECDSA.ts](./src/proveableECDSA.ts) is the file in which all the logic & modular arithemetic for ECDSA Verification takes place. 
The function `proveableECDSA(...):<Promise:Bool>` is the function which recives the data for the verification of a valid Signature. 

Tests for modular arithetmics function can be logged by line 225 in [proveableECDSA.ts](./src/proveableECDSA.ts) file. 

# How to run?

To run the sample code, which invokes a zkProgram with test-vector values for Signatyre {r,s}, hash(message), & PublicKey{x,y}, you can do `npx tsx src/index.ts`.

[Apache-2.0](LICENSE)
