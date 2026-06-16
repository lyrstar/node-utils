/**
 * 生成随机 Token 字符串（基于时间戳 + 随机数）
 * @returns {string}
 */
export const createToken = () => Date.now().toString(36) + (((1 + Math.random()) * 0x1000000) | 0).toString(36).substring(0, 4);
