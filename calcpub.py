# from ecdsa import ellipticcurve, numbertheory, ecdsa

def decompress_pubkey_secp256k1(pubkey_hex):
    # secp256k1 curve parameters
    p = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    a = 0
    b = 7

    # Parse the compressed public key
    pubkey_bytes = bytes.fromhex(pubkey_hex)
    x = int.from_bytes(pubkey_bytes[1:], byteorder='big')
    y_parity = pubkey_bytes[0] - 2  # 0 for even, 1 for odd

    # Calculate y^2 = x^3 + ax + b (mod p)
    y_square = (pow(x, 3, p) + a * x + b) % p

    # Calculate y = sqrt(y^2) mod p
    y = pow(y_square, (p + 1) // 4, p)

    # Adjust y based on parity
    if y % 2 != y_parity:
        y = p - y

    return (x, y)

# Example usage
compressed_pubkey_hex = "0283bbaa97bcdddb1b83029ef3bf80b6d98ac5a396a18ce8e72e59d3ad0cf2e767"
point = decompress_pubkey_secp256k1(compressed_pubkey_hex)
print(f"Decompressed Point: (x, y) = {point}")
