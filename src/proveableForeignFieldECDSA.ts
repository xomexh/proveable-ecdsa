import { Bool, Field, Provable,createForeignField } from 'o1js';

const p = BigInt('115792089237316195423570985008687907853269984665640564039457584007908834671663');
const n = BigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337');

class FieldSECP256K1 extends createForeignField(p){}

// async function isPointOnCurve(x: Field, y: Field): Promise<Bool> {
//     const a = Field(0);
//     const b = Field(7);
//     const p = Field('115792089237316195423570985008687907853269984665640564039457584007908834671663'); // Assuming this is the same p as used elsewhere

//     const leftSide = y.square();
//     const rightSide = x.mul(x).mul(x).add(a.mul(x)).add(b);

//     return leftSide.equals(rightSide);
// }

async function ellipticCurveAdd(
  x1: FieldSECP256K1,
  y1: FieldSECP256K1,
  x2: FieldSECP256K1,
  y2: FieldSECP256K1,
): Promise<[FieldSECP256K1, FieldSECP256K1]> {
  // Handle point at infinity
  if (x1.assertEquals(FieldSECP256K1.from(0)) && y1.assertEquals(FieldSECP256K1.from(0))) return [x2, y2];
  if (x2.assertEquals(FieldSECP256K1.from(0)) && y2.assertEquals(FieldSECP256K1.from(0))) return [x1, y1];

  let m: FieldSECP256K1;
  if (x1.assertEquals(x2) && y1.assertEquals(y2)) {
    // Point doubling for secp256k1: m = (3x²) / (2y)
    const xAlmost = x1.assertAlmostReduced()
    const xsqaure = xAlmost.mul(xAlmost);

    const yAlmost = y1.assertAlmostReduced()
    const yOpration = yAlmost.mul(FieldSECP256K1.from(2))
    m = xsqaure.assertCanonical().mul(FieldSECP256K1.from(3)).assertCanonical().div(yOpration.assertCanonical());
  } else {
    // Point addition
    m = y2.sub(y1).assertCanonical().div(x2.sub(x1).assertCanonical());
  }

  const mAlmost = m.assertAlmostReduced();
  const mSquare = mAlmost.mul(mAlmost);

  const x3 = mSquare.sub(x1).sub(x2);
  const y3 = m.assertAlmostReduced().mul(x1.sub(x3).assertCanonical()).sub(y1);

  return [x3, y3];
}

async function ellipticCurveMultiply(
  k: FieldSECP256K1,
  x: FieldSECP256K1,
  y: FieldSECP256K1,
  p: FieldSECP256K1
): Promise<[FieldSECP256K1, FieldSECP256K1]> {
  // Handle special cases: return point at infinity
//   if (!k.assertEquals(FieldSECP256K1.from(0)) || (!x.assertEquals(FieldSECP256K1.from(0)) && !y.assertEquals(FieldSECP256K1.from(0)))) {
//     return [FieldSECP256K1.from(0), FieldSECP256K1.from(0)];
//   }

  let result: [FieldSECP256K1, FieldSECP256K1] = [FieldSECP256K1.from(0), FieldSECP256K1.from(0)]; // Initialize result as point at infinity
  let current: [FieldSECP256K1, FieldSECP256K1] = [x, y];  // Start with the input point

  let absK = k;
  let negateResult = false;

//   // Check if k is negative
//   if (k.assertEquals(FieldSECP256K1.from(0))) {
//     absK = k.neg();
//     negateResult = true;
//   }

  while (absK > FieldSECP256K1.from(0n)) {
    const check = absK
    if (check & FieldSECP256K1.from(1)) {
      // If the least significant bit is 1, add current point to result
      result = await ellipticCurveAdd(result[0], result[1], current[0], current[1]);
    }
    // Double the current point
    current = await ellipticCurveAdd(current[0], current[1], current[0], current[1]);
    absK = absK.assertCanonical().div(FieldSECP256K1.from(2)); // Divide k by 2 to process the next bit
  }

  // If the original k was negative, negate the y-coordinate of the result
  if (negateResult) {
    result[1] = p.sub(result[1]);
  }

  return result;
}

// async function modularTests(
//   point1: [Field, Field],
//   point2: [Field, Field],
//   G_x: Field,
//   G_y: Field,
//   p: Field
// ) {
//   // Associativity:
//   let left = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...(await ellipticCurveAdd(...point1, ...point2, p)), G_x, G_y, p)), p);
//   let right = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...point1, ...(await ellipticCurveAdd(...point2, G_x, G_y, p)), p)), p);
//   left[0].equals(right[0]) && left[1].equals(right[1]) ? console.log("Associative property passed.") : console.log("Associative property failed.");

//   // Commutative
//   left = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...point1, ...point2, p)), p);
//   right = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...point2, ...point1, p)), p);
//   left[0].equals(right[0]) && left[1].equals(right[1]) ? console.log("Commutative property passed.") : console.log("Commutative property failed.");

//   // Identity Element
//   const O: [Field, Field] = [Field(0), Field(0)]; // Point at infinity
//   let result = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...point1, ...O, p)), p);
//   result[0].equals(point1[0]) && result[1].equals(point1[1]) ? console.log("Identity element passed.") : console.log("Identity element failed.");

//   // Inverse element
//   const negP: [Field, Field] = [point2[0], p.sub(point2[1])];
//   result = await ellipticCurveMultiply(Field(1), ...(await ellipticCurveAdd(...point2, ...negP, p)), p);
//   result[0].equals(Field(0)) && result[1].equals(Field(0)) ? console.log("Inverse element passed") : console.log("Inverse element failed");

//   // Distributive
//   left = await ellipticCurveMultiply(Field(10), ...(await ellipticCurveAdd(...point1, ...point2, p)), p);
//   right = await ellipticCurveAdd(...(await ellipticCurveMultiply(Field(10), ...point1, p)), ...(await ellipticCurveMultiply(Field(10), ...point2, p)), p);
//   left[0].equals(right[0]) && left[1].equals(right[1]) ? console.log("Distributivity passed") : console.log("Distributivity failed");

//   // Scalar Mult Test
// //   let k = Field(8);
// //   let expected = point2;
// //   for (let i = Field(1); i.lessThan(k); i = i.add(Field(1))) {
// //     expected = await ellipticCurveAdd(...expected, ...point2, p);
// //   }
// //   result = await ellipticCurveMultiply(k, point2[0], point2[1], p);
// //   result[0].equals(expected[0]) && result[1].equals(expected[1]) ? console.log("Scalar multiplication passed") : console.log("Scalar multiplication failed");

//   // Point doubling
//   let P = point2;
//   left = await ellipticCurveMultiply(Field(2), P[0], P[1], p);
//   right = await ellipticCurveAdd(P[0], P[1], P[0], P[1], p);
//   left[0].equals(right[0]) && left[1].equals(right[1]) ? console.log("Point doubling passed") : console.log("Point doubling failed");

//   // Point onCurve
//   P = point2;
//   let k = Field(100n);
//   result = await ellipticCurveMultiply(k, P[0], P[1], p);
//   await isPointOnCurve(result[0], result[1]) ? console.log("Point on curve.") : console.log("Point not on curve.");
// }

export async function proveableECDSA(
  ee: FieldSECP256K1,
  s: FieldSECP256K1,
  r: FieldSECP256K1,
  pub_x: FieldSECP256K1,
  pub_y: FieldSECP256K1
): Promise<Bool> {
  const p = FieldSECP256K1.from('115792089237316195423570985008687907853269984665640564039457584007908834671663');
  const n = FieldSECP256K1.from('115792089237316195423570985008687907852837564279074904382605163141518161494337');

  const G_x = FieldSECP256K1.from('55066263022277343669578718895168534326250603453777594175500187360389116729240');
  const G_y = FieldSECP256K1.from('32670510020758816978083085130507043184471273380659243275938904335757337482424');

  // 1. Verify that r and s are integers in [1, n-1]
  // This step is omitted as in the original function

  // 2. Calculate e = HASH(m). Receive this directly from zkProgram.
  const e = ee;

  console.log(p);
  console.log(s);
  console.log(n);
  console.log('Inside Function:', e);
  console.log(e);

  // 3. Calculate w = s^-1 mod n
  //const sInv = await modInverse(s, n);
  const sInv = s.assertCanonical().inv()
  console.log('Modular Inv of s:',sInv);

  // 4. Calculate u1 = ew mod n and u2 = rw mod n
  const u1 = e.assertAlmostReduced().mul(sInv);
  const u2 = r.assertAlmostReduced().mul(sInv);
  console.log(u1);
  console.log(u2);

  // 5. Calculate (x, y) = u1G + u2Q
  const point1 = await ellipticCurveMultiply(u1, G_x, G_y,p);
  const point2 = await ellipticCurveMultiply(u2, pub_x, pub_y,p);
  const R = await ellipticCurveAdd(point1[0], point1[1], point2[0], point2[1]);
  console.log(point1);
  console.log(point2);

  //await modularTests(point1, point1, G_x, G_y, p);
  console.log(R[0]);
  console.log(R[1]);
  
  
  // 6. If (x, y) = O (the point at infinity), the signature is invalid
  if (R[0].assertEquals(FieldSECP256K1.from(0)) && R[1].assertEquals(FieldSECP256K1.from(0))) {
    console.log("Point at Infinity.");
    return Bool(false);
  }

  // 7. Calculate v = x mod n
  const v = R[0];

  // 8. The signature is valid if and only if v = r
  if (v.assertEquals(r)) {
    console.log("Recovery Point:", R.map(f => f.toString()));
    //console.log("Signature received:", {r: r.toString(), s: s.toString()});
    console.log("X-affine of RecoveryPoint R == r of signature. Hence valid signature.");
    console.log("Signature is valid.");
    return Bool(true);
  } else {
    return Bool(false);
  }
}

async function proveableECDSAtest(){
    const e = FieldSECP256K1.from(71434212616171258881167833273589199798160798266365951356480825534922218147392n);
    const r = FieldSECP256K1.from(81447002185398275822095816021075624568224161238760933553486802907392490238292n);
    const s = FieldSECP256K1.from(7946449788279160792259694071968415267819694180200632783208719855055985626056n)

  const publicKey = {
    x:FieldSECP256K1.from(59584560953242332934734563514771605484743832818030684748574986816321863477095n),
    y:FieldSECP256K1.from(35772424464574968427090264313855970786042086272413829287792016132157953251778n)
  }
  const result = await proveableECDSA(e ,s, r,publicKey.x,publicKey.y)
  if(result.toBoolean()){
    console.log("Valid Signature!")
  }
}

await proveableECDSAtest();

