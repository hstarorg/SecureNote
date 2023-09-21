import { Buffer } from 'buffer';

async function getAesKey(key: string) {
  const subtle = globalThis.crypto.subtle;
  const aesKey = await subtle.importKey('raw', Buffer.from(key, 'utf-8'), 'AES-GCM', true, ['encrypt', 'decrypt']);
  return aesKey;
}

/**
 * 浏览器，AES 加密
 * @param originalText 原文（utf8）
 * @param key 秘钥（32位）
 * @param iv 随机种子（16进制）
 * @returns
 */
async function aes256GcmEncrypt(
  originalText: string,
  key: string,
  options?: { iv?: string; encoding?: BufferEncoding }
) {
  const subtle = globalThis.crypto.subtle;
  const aesKey = await getAesKey(key);

  const encoding = options?.encoding ?? 'hex';

  // auto generate IV
  let iv = options?.iv;
  if (!iv) {
    const array = new Uint8Array(12);
    const filledArray = globalThis.crypto.getRandomValues(array);
    iv = Buffer.from(filledArray).toString('hex');
  }

  const encrypted = await subtle.encrypt(
    { name: 'AES-GCM', iv: Buffer.from(iv, 'hex') },
    aesKey,
    Buffer.from(originalText, 'utf-8')
  );

  const cipherText = Buffer.from(encrypted).toString(encoding);
  return { iv, cipherText };
}

/**
 * 浏览器，AES 解密
 * @param cipherText 加密串（16进制）
 * @param key 秘钥
 * @param iv 随机种子（16进制）
 * @returns
 */
async function aes256GcmDecrypt(cipherText: string, key: string, iv: string, options?: { encoding?: BufferEncoding }) {
  const subtle = globalThis.crypto.subtle;
  const aesKey = await getAesKey(key);

  const encoding = options?.encoding ?? 'hex';
  const cipherTextBuf = Buffer.from(cipherText, encoding);

  const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(iv, 'hex') }, aesKey, cipherTextBuf);

  const originalText = Buffer.from(decrypted).toString('utf-8');
  return originalText;
}

function splitEncryptionText(encryptionText: string) {
  const IVSize = 12 * 2;
  return {
    iv: encryptionText.slice(0, IVSize),
    cipherText: encryptionText.slice(IVSize)
  };
}

function generateAesIV() {
  const array = new Uint8Array(12);
  const filledArray = globalThis.crypto.getRandomValues(array);
  return Buffer.from(filledArray).toString('hex');
}

export async function aesEncrypt(originalText: string, password: string): Promise<string> {
  const filledPwd = password.padEnd(32, '0').slice(0, 32);

  const iv = generateAesIV();

  const result = await aes256GcmEncrypt(originalText, filledPwd, {
    iv,
    encoding: 'base64'
  });
  return result.iv + result.cipherText;
}

export async function aesDecrypt(encryptionText: string, password: string): Promise<string> {
  const filledPwd = password.padEnd(32, '0').slice(0, 32);
  const splitResult = splitEncryptionText(encryptionText);
  return aes256GcmDecrypt(splitResult.cipherText, filledPwd, splitResult.iv, {
    encoding: 'base64'
  });
}
