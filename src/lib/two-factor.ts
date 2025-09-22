import crypto from "crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { hash, compare } from "bcryptjs";

authenticator.options = {
  digits: 6,
  window: 1,
};
export function encryptTwoFactorSecret(secret: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(".");
}

export function decryptTwoFactorSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid two-factor secret payload");
  }
  const key = deriveKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

export function generateTwoFactorSecret(label: string) {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(label, "EZComputers", secret);
  return { secret, otpauthUrl };
}

export async function generateTwoFactorQrCode(data: string) {
  return QRCode.toDataURL(data, { margin: 1 });
}

export function verifyTotpToken(secret: string, token: string) {
  return authenticator.verify({ token, secret });
}

export function generateRecoveryCodes(count = 8) {
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
  }
  return codes;
}

export async function hashRecoveryCodes(codes: string[]) {
  return Promise.all(codes.map((code) => hash(code, 10)));
}

export async function findRecoveryCodeMatch(input: string, hashedCodes: string[]) {
  for (let index = 0; index < hashedCodes.length; index += 1) {
    const hashed = hashedCodes[index];
    const matches = await compare(input, hashed);
    if (matches) {
      return index;
    }
  }
  return -1;
}

export function removeRecoveryCodeAt(codes: string[], index: number) {
  return codes.filter((_, idx) => idx !== index);
}









