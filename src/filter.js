/**
 * koa 过滤器 中间件
 */
import {md5} from "./crypto";

/**
 * Koa 鉴权中间件
 * @param {object}   ctx                  - Koa 上下文
 * @param {Function} next                 - 下一个中间件
 * @param {object}   options
 * @param {string}   options.NODE_ENV     - 当前运行环境（'pro' 为生产）
 * @param {boolean}  options.auth         - 是否开启鉴权，false 时直接放行
 * @param {object}   options.APPS         - AppId → { appId, appSecret } 映射表
 * @param {number}   [options.version=1]  - 签名算法版本（1 或 2）
 */
export const authentication = async (ctx, next, {NODE_ENV, auth, APPS, version = 1}) => {
    // 校验参数
    if (!checkParams(ctx)) return;
    if (!auth) return await next();
    if (ctx.headers.appid === 'appId' && NODE_ENV !== 'pro') return await next();
    // 校验AppId
    if (!checkAppId(ctx, APPS)) return;
    let appSecret = APPS[ctx.headers.appid].appSecret;
    // 校验时间
    if (!checkTimestamp(ctx)) return;
    // 校验签名
    if (version === 2) {
        if (!checkSign2(ctx, appSecret)) return;
    } else {
        if (!checkSign(ctx, appSecret)) return;
    }
    await next();
}

/**
 * 生成 v1 签名：md5( md5(signBody + timestamp) + appSecret )
 * @param {object} ctx
 * @param {string} appSecret
 * @returns {string}
 */
const getSign = (ctx, appSecret) => {
    return md5(md5(getSignBody(ctx) + ctx.headers.timestamp) + appSecret);
}

/**
 * 校验 v1 签名，不匹配时输出调试日志并设置错误响应
 * @param {object} ctx
 * @param {string} appSecret
 * @returns {boolean}
 */
const checkSign = (ctx, appSecret) => {
    let {appid, timestamp, sign} = ctx.headers;
    if (sign !== getSign(ctx, appSecret)) {
        console.log('you sign:', sign);
        console.log('true sign:', getSign(ctx, appSecret));
        console.log('sign body:', getSignBody(ctx));
        // console.log(`[${timestamp}] ${appid}:${appSecret}`)
        setError(ctx, 423, '签名错误');
        return false;
    }
    return true;
}

/**
 * 拼接 v1 签名体：将 query 和 body 的所有值直接转字符串后拼接
 * @param {object} ctx
 * @returns {string}
 */
const getSignBody = (ctx) => {
    let str = '';
    for (let attr in ctx.request.query) str += String(ctx.request.query[attr]);
    for (let attr in ctx.request.body) str += String(ctx.request.body[attr]);
    return str;
}

/**
 * 生成 v2 签名：md5( md5(signBody + timestamp) + appSecret )
 * @param {object} ctx
 * @param {string} appSecret
 * @returns {string}
 */
const getSign2 = (ctx, appSecret) => {
    return md5(md5(getSignBody2(ctx) + ctx.headers.timestamp) + appSecret);
}

/**
 * 校验 v2 签名，不匹配时输出调试日志并设置错误响应
 * @param {object} ctx
 * @param {string} appSecret
 * @returns {boolean}
 */
const checkSign2 = (ctx, appSecret) => {
    let {appid, timestamp, sign} = ctx.headers;
    if (sign !== getSign2(ctx, appSecret)) {
        console.log('you sign:', sign);
        console.log('true sign:', getSign2(ctx, appSecret));
        console.log('sign body:', getSignBody2(ctx));
        // console.log(`[${timestamp}] ${appid}:${appSecret}`)
        setError(ctx, 423, '签名错误');
        return false;
    }
    return true;
}

/**
 * 拼接 v2 签名体：object 类型值做 JSON.stringify，其余直接转字符串
 * @param {object} ctx
 * @returns {string}
 */
const getSignBody2 = (ctx) => {
    let str = '';
    for (let attr in ctx.request.query) str += typeof ctx.request.query[attr] === 'object' ? JSON.stringify(ctx.request.query[attr]) : String(ctx.request.query[attr]);
    for (let attr in ctx.request.body) str += typeof ctx.request.body[attr] === 'object' ? JSON.stringify(ctx.request.body[attr]) : String(ctx.request.body[attr]);
    return str;
}

/**
 * 校验请求头必填参数（appid / timestamp / sign）
 * @param {object} ctx
 * @returns {boolean}
 */
const checkParams = (ctx) => {
    let {appid, timestamp, sign} = ctx.headers;
    if (!appid || !timestamp || !sign) {
        setError(ctx, 421, '未签名');
        return false;
    }
    return true;
}

/**
 * 校验 AppId 是否在已注册的应用表中
 * @param {object} ctx
 * @param {object} APPS - AppId → { appSecret } 映射表
 * @returns {boolean}
 */
const checkAppId = (ctx, APPS) => {
    if (!APPS.hasOwnProperty(ctx.headers.appid)) {
        setError(ctx, 500, '未注册的APP');
        return false;
    }
    return true;
}

/**
 * 校验时间戳，与服务器时间偏差不得超过 10 分钟（600000ms）
 * @param {object} ctx
 * @returns {boolean}
 */
const checkTimestamp = (ctx) => {
    if (Math.abs(Date.now() - Number(ctx.headers.timestamp)) > 600000) {
        setError(ctx, 422, '时间错误');
        return false;
    }
    return true;
}

/**
 * 统一设置错误响应
 * @param {object} ctx    - Koa 上下文
 * @param {number} status - HTTP 状态码
 * @param {string} body   - 响应体文本
 */
const setError = (ctx, status, body) => {
    ctx.response.status = status;
    ctx.response.body = body;
};
