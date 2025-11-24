import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * 환경변수에서 암호화 키 가져오기
 * 32바이트 키가 필요 (AES-256)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // 개발 환경용 기본 키 (프로덕션에서는 반드시 환경변수 설정)
    console.warn('⚠️  ENCRYPTION_KEY not set, using default key (unsafe for production)');
    return crypto.scryptSync('default-encryption-key-change-this', 'salt', 32);
  }

  // 키를 32바이트로 정규화
  return crypto.scryptSync(key, 'salt', 32);
}

/**
 * API 키를 암호화
 * @param apiKey 평문 API 키
 * @returns 암호화된 문자열 (iv:encryptedData 형식)
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV와 암호화된 데이터를 콜론으로 연결
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('API key encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * 암호화된 API 키를 복호화
 * @param encryptedKey 암호화된 문자열 (iv:encryptedData 형식)
 * @returns 평문 API 키
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    const parts = encryptedKey.split(':');

    if (parts.length !== 2) {
      throw new Error('Invalid encrypted key format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('API key decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * API 키를 마스킹 (로그/UI 표시용)
 * @param apiKey 평문 API 키
 * @returns 마스킹된 문자열 (예: sk-...xyz)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***';
  }

  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);

  return `${start}...${end}`;
}
