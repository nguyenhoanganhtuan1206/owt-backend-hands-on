import { v1 as uuid } from 'uuid';

export class GeneratorProvider {
  static uuid(): string {
    return uuid();
  }

  static fileName(ext: string): string {
    return GeneratorProvider.uuid() + '.' + ext;
  }

  static getS3PublicUrl(key: string): string {
    if (!key) {
      throw new TypeError('key is required');
    }

    return `https://s3.${process.env.AWS_S3_BUCKET_NAME_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${key}`;
  }

  static getS3Key(publicUrl: string): string {
    if (!publicUrl) {
      throw new TypeError('key is required');
    }

    const exec = new RegExp(
      `(?<=https://s3.${process.env.AWS_S3_BUCKET_NAME_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/).*`,
    ).exec(publicUrl);

    if (!exec) {
      throw new TypeError('publicUrl is invalid');
    }

    return exec[0];
  }

  static generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static generatePassword(): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '?=.*[!#$%&()*+,.:;<>?@[\\]^_{}~-]';

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getRandomChar = (charSet: string): string => {
      const randomIndex = Math.floor(Math.random() * charSet.length);

      return charSet[randomIndex];
    };

    const uppercaseChar = getRandomChar(uppercaseChars);
    const lowercaseChar = getRandomChar(lowercaseChars);
    const numberChar = getRandomChar(numberChars);
    const specialChar = getRandomChar(specialChars);

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;
    const additionalChars = Array.from({ length: 4 })
      .fill(0)
      .map(() => getRandomChar(allChars))
      .join('');

    const passwordChars =
      uppercaseChar +
      lowercaseChar +
      numberChar +
      specialChar +
      additionalChars;

    return [...passwordChars].sort(() => Math.random() - 0.5).join('');
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .replace(/[^\dA-Za-z]+/g, '')
      .slice(0, Math.max(0, length));
  }

  static getS3Url(folder: string, userId: number, fileName: string): string {
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${folder}/${userId}/${fileName}`;
  }
}
