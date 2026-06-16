import os from 'os';

/**
 * 获取请求客户端真实 IP
 * @param {object} req - HTTP 请求对象
 * @returns {string}
 */
export const getRequestIp = req => {
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (ip.split(',').length > 0) ip = ip.split(',')[0];
    return ip;
}

/**
 * 获取本机 IPv4 地址
 * @returns {string|undefined}
 */
export const getIPAddress = () => {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
