import * as crypto from 'crypto';

interface HexPublicKey {
    x: string;
    y: string;
}

function pemPublicKeyToHex(pemKey: string): HexPublicKey {
    // Remove PEM headers and newlines
    const pemContents = pemKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, '');
    
    // Decode the base64 content
    const derBuffer = Buffer.from(pemContents, 'base64');
    
    // Parse the DER-encoded key
    const publicKey = crypto.createPublicKey({
        key: derBuffer,
        format: 'der',
        type: 'spki'
    });
    
    // Export the key components
    const jwk = publicKey.export({ format: 'jwk' }) as crypto.JsonWebKey;
    
    if (!jwk.x || !jwk.y) {
        throw new Error('Invalid public key format');
    }
    
    // Convert x and y coordinates to hex
    const xHex = Buffer.from(jwk.x, 'base64').toString('hex');
    const yHex = Buffer.from(jwk.y, 'base64').toString('hex');
    
    return { x: xHex, y: yHex };
}

function publicKeyToCompressed(x: bigint, y: bigint): string {
    // Convert x to a 32-byte hex string, padding with zeros if necessary
    let xHex = x.toString(16).padStart(64, '0');
    
    // Determine the prefix based on whether y is even or odd
    const prefix = y % 2n === 0n ? '02' : '03';
    
    // Combine the prefix and x-coordinate
    return prefix + xHex;
}

// Usage example
const x = BigInt('0x'+'83bbaa97bcdddb1b83029ef3bf80b6d98ac5a396a18ce8e72e59d3ad0cf2e767')
const y = BigInt('0x'+'4f1679887d72620cf208d9ed8b461b3ba60e1101a8ecc9cfe7c93063d00399c2');

const compressedKey = publicKeyToCompressed(x, y);
console.log('Compressed public key:', compressedKey);

console.log(compressedKey=='0283bbaa97bcdddb1b83029ef3bf80b6d98ac5a396a18ce8e72e59d3ad0cf2e767');

// Usage
const pemKey = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEEmDCEiyeJE4a9RUb7eDDriO1TXxZaIHT
7rrSHzfdh4xcmgwamt52c3qIEb1qf5KHyXjuOWqonBHkcinSzLVS8A==
-----END PUBLIC KEY-----`;

const pemAct = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEg7uql7zd2xuDAp7zv4C22YrFo5ahjOjn
LlnTrQzy52dPFnmIfXJiDPII2e2LRhs7pg4RAajsyc/nyTBj0AOZwg==
-----END PUBLIC KEY-----
`

try {
    const hexKey = pemPublicKeyToHex(pemKey);
    console.log(hexKey);
} catch (error) {
    console.error('Error converting key:', error);
}