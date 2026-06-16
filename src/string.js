/**
 * 10 进制整数转 62 进制字符串
 * @param {number} number - 待转换的 10 进制整数
 * @returns {string}
 */
export const string10to62 = number => {
    let dict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', s62 = '';
    for (; number > 0; number = Math.floor(number / 62)) s62 = dict.charAt(number % 62) + s62;
    return s62;
}

/**
 * 62 进制字符串转 10 进制整数
 * @param {string} string - 待转换的 62 进制字符串
 * @returns {number}
 */
export const string62to10 = string => {
    let dict = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', i = string.length - 1, num = 0;
    for (let s of string) num += (Math.pow(62, i--) * dict.indexOf(s));
    return num;
}
