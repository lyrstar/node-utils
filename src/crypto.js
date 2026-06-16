import crypto from 'crypto';

/**
 * MD5 哈希
 * @param {string} str - 待哈希字符串
 * @returns {string}
 */
export const md5 = str => crypto.createHash('md5').update(str, 'utf8').digest('hex');
