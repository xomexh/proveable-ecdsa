import hmac
import hashlib
import math

q = 0x4000000000000000000020108A2E0CC0D99F8A5EF
qlen = 163
x = '09A4D6792295A7F730FC3F2B49CBC0F62E862272F'

m="sample".encode('utf-8')
mhash = hashlib.sha256(m).hexdigest()
print(mhash)

def int2octectTransform(x,qlen):
    rlen = 8*math.ceil(qlen/8)
    num_bytes = rlen // 8

    x_octets = x.to_bytes(num_bytes, byteorder='big')
    return x_octets

print(int2octectTransform(int(x,16), 163).hex()) #implemented correctly

def hex_to_bits(hex_str):
    # Convert hex string to binary string
    return bin(int(hex_str, 16))[2:].zfill(len(hex_str) * 4)

def bits2int(bit_seq, qlen):
    blen = len(bit_seq)
    
    if blen > qlen:
        bit_seq = bit_seq[:qlen]
    elif blen < qlen:
        bit_seq = '0' * (qlen - blen) + bit_seq
    
    int_value = int(bit_seq, 2)
    return int_value

def bits2octets(bit_seq, q, qlen):
    # Step 1: Convert the bit sequence into an integer z1 using bits2int
    z1 = bits2int(bit_seq, qlen)
    
    # Step 2: Reduce z1 modulo q to get z2
    z2 = z1 % q
    
    # Step 3: Convert z2 into a sequence of octets using int2octets
    octets = int2octectTransform(z2, qlen)
    
    return octets

bit_sequence = hex_to_bits(mhash)
print(bits2octets(bit_sequence,q,163).hex())

def hash_function(message, hash_name='sha256'):
    """ Hash function H """
    h = hashlib.new(hash_name)
    h.update(message)
    return h.digest()

def hmac_function(key, message, hash_name='sha256'):
    """ HMAC function """
    return hmac.new(key, message, hashlib.new(hash_name)).digest()

def generate_k(message, x, q, hash_name='sha256'):
    # Step 1: Process the message through the hash function
    
    h1 = message
    hlen = len(h1) * 8  # Length of h1 in bits

    int2octectOfx = int2octectTransform(int(x,16), 163)
    bit_sequence = hex_to_bits(message)
    bits2octetsOfh=bits2octets(bit_sequence,q,163)

    print(int2octectOfx)
    print(bits2octetsOfh)

    # Step 2: Set V
    rlen = 8 * math.ceil(hlen / 8)
    V = bytes([0x01] * (rlen // 8))

    # Step 3: Set K
    K = bytes([0x00] * (rlen // 8))

    # Step 4: Compute K
    K = hmac_function(K, V + b'\x00' + int2octectOfx + bits2octetsOfh , hash_name)

    # Step 5: Compute V
    V = hmac_function(K, V, hash_name)

    # Step 6: Compute K
    K = hmac_function(K, V + b'\x01' +int2octectOfx + bits2octetsOfh , hash_name)

    # Step 7: Compute V
    V = hmac_function(K, V, hash_name)

    # Step 8: Generate k
    qlen = q.bit_length()
    while True:
        T = b''

        while len(T) * 8 < qlen:
            V = hmac_function(K, V, hash_name)
            T += V

        k = bits2int(bin(int.from_bytes(T, byteorder='big'))[2:], qlen)
        if 1 <= k < q:
            return k

        K = hmac_function(K, V + b'\x00', hash_name)
        V = hmac_function(K, V, hash_name)

k = generate_k(mhash,x,q)
print(k)
