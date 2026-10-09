const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Four digits, like the real delivery code. */
export function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** "FP-7KQ2M9", the shape of a Foodprint order code. */
export function generateOrderCode(): string {
  let code = "FP-";
  for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return code;
}
