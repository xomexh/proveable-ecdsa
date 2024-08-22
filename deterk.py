import hmac
import hashlib

def int_to_bytes(x, byte_length):
    return x.to_bytes(byte_length, 'big')

def bits2int(bits, q):
    z1 = int.from_bytes(bits, 'big')
    z2 = z1 if z1 < q else z1 - q
    return z2

def generate_k(private_key, msg_hash, q, hash_func=hashlib.sha256):
    h1 = msg_hash
    x = int.from_bytes(private_key, 'big')
    h1_len = len(h1)
    qlen = (q.bit_length() + 7) // 8
    
    v = b'\x01' * 32
    k = b'\x00' * 32
    
    def hmac_sha256(key, msg):
        return hmac.new(key, msg, hash_func).digest()

    k = hmac_sha256(k, v + b'\x00' + int_to_bytes(x, qlen) + h1)
    v = hmac_sha256(k, v)
    k = hmac_sha256(k, v + b'\x01' + int_to_bytes(x, qlen) + h1)
    v = hmac_sha256(k, v)

    attempts = 0
    while True:
        t = b''
        while len(t) < qlen:
            v = hmac_sha256(k, v)
            t += v
        
        k_candidate = bits2int(t[:qlen], q)
        if 1 <= k_candidate < q:
            return k_candidate
        
        k = hmac_sha256(k, v + b'\x00')
        v = hmac_sha256(k, v)

        attempts += 1
        if attempts > 1000:
            raise Exception("Failed to generate valid k after 1000 attempts")





# K-163 curve parameters
q = 2**163 + 2**7 + 2**6 + 2**3 + 1  # Field size for K-163

# Example usage:
private_key = b'0x09A4D6792295A7F730FC3F2B49CBC0F62E862272F'  # 163 bits = 21 bytes (rounded up)
msg = b"sample"
msg_hash = hashlib.sha256(msg).digest()  # Using SHA-256 for message hash

# try:
k = generate_k(private_key, msg_hash, q)
print(f"Deterministic k for K-163: {k}")
print(f"k in hex: {hex(k)}")
print(f"k bit length: {k.bit_length()}")
# except Exception as e:
#     print(f"Error: {e}")
