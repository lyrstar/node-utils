/**
 * Base64 编码
 * @param {string} str - 待编码字符串
 * @returns {string}
 */
export const enBase64 = str => Buffer.from(str).toString('base64');

/**
 * Base64 解码
 * @param {string} str - 待解码字符串
 * @returns {string}
 */
export const deBase64 = str => Buffer.from(str, 'base64').toString();
