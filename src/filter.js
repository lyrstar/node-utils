/**
 * koa 过滤器 中间件
 */
import {md5} from "./crypto.js";

// ─── 导出中间件 ───────────────────────────────────────────────────────────────

/**
 * Koa 鉴权中间件（柯里化）
 * @param {object}  options
 * @param {string}  options.NODE_ENV    - 运行环境，'pro' 为生产
 * @param {boolean} options.auth        - false 时跳过鉴权直接放行
 * @param {object}  options.APPS        - { [appId]: { appSecret } } 映射表
 * @param {number}  [options.version=1] - 签名算法版本（1 或 2）
 * @returns {Function} Koa 中间件
 */
export const KoaAuthentication = ({NODE_ENV, auth, APPS, version = 1}) => {
    return async (ctx, next) => {
        // 校验请求头必填字段：appid / timestamp / sign
        const {appid, timestamp, sign} = ctx.headers;
        if (!appid || !timestamp || !sign) {
            setError(ctx, 421, '未签名');
            return;
        }

        if (!auth) return await next();
        if (appid === 'appId' && NODE_ENV !== 'pro') return await next();

        // 校验 AppId 是否已注册
        if (!APPS.hasOwnProperty(appid)) {
            setError(ctx, 500, '未注册的APP');
            return;
        }
        const appSecret = APPS[appid].appSecret;

        // 校验时间戳，偏差不得超过 10 分钟
        if (Math.abs(Date.now() - Number(timestamp)) > 600000) {
            setError(ctx, 422, '时间错误');
            return;
        }

        // 校验签名
        if (version === 2) {
            if (!checkSign2(ctx, appSecret)) return;
        } else {
            if (!checkSign(ctx, appSecret)) return;
        }
        await next();
    }
}

/**
 * Koa 跨域 + URL 前缀剥离中间件（柯里化）
 * @param {string} baseurl - 需要从请求路径中剥离的 URL 前缀
 * @returns {Function} Koa 中间件
 */
export const KoaOMService = (baseurl) => {
    if (!baseurl) throw Error('no baseurl');
    if (!baseurl.startsWith('/')) baseurl = '/' + baseurl;
    return async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', '*');
        ctx.set('Access-Control-Allow-Headers', '*');

        if (ctx.request.originalUrl.startsWith(baseurl)) {
            ctx.request.originalUrl = ctx.request.originalUrl.replace(baseurl, '');
            ctx.request.url = ctx.request.url.replace(baseurl, '');
        }

        if (['OPTIONS', 'HEAD'].includes(ctx.method)) {
            ctx.body = 200;
        } else {
            await next();
        }
    }
}

/**
 * Koa 请求/响应日志中间件（柯里化）
 * - 超出 maxLength 的 body 自动截断并标注实际长度
 * - 响应日志附带请求耗时
 * @param {number} [maxLength=3000] - body 最大输出字符数
 * @returns {Function} Koa 中间件
 */
export const KoaLog = (maxLength = 3000) => {
    return async (ctx, next) => {
        const {appid, timestamp} = ctx.headers;
        const start = Date.now();

        const reqBodyStr = JSON.stringify(ctx.request.body) ?? '';
        const reqBody = reqBodyStr.length > maxLength ? `${reqBodyStr.substring(0, maxLength)} ... (length: ${reqBodyStr.length} > ${maxLength})` : ctx.request.body;

        console.log('request:', JSON.stringify({
            method: ctx.method, url: ctx.url, headers: {appid, timestamp}, query: ctx.query, body: reqBody
        }));

        await next();

        const elapsed = Date.now() - start;

        try {
            const resBodyStr = JSON.stringify(ctx.body) ?? '';
            const resBody = ctx.response.is('html') ? 'html' : resBodyStr.length > maxLength ? `${resBodyStr.substring(0, maxLength)} ... (length: ${resBodyStr.length} > ${maxLength})` : ctx.body;

            console.log('response:', JSON.stringify({
                status: ctx.status,
                method: ctx.method,
                url: ctx.url,
                headers: {appid, timestamp},
                message: ctx.message,
                elapsed: `${elapsed}ms`,
                body: resBody
            }));
        } catch (e) {
            console.log('response:', JSON.stringify({
                status: ctx.status, message: ctx.message, body: 'log fail: ' + e
            }));
        }

        console.log('\n');
    }
}

// ─── 签名（私有）─────────────────────────────────────────────────────────────

/** v1：各参数值直接 String() 后拼接，不保留结构 */
const getSignBody = (ctx) => {
    let str = '';
    for (let attr in ctx.request.query) str += String(ctx.request.query[attr]);
    for (let attr in ctx.request.body) str += String(ctx.request.body[attr]);
    return str;
}

/** v2：object 类型值 JSON.stringify，其余 String()；保留嵌套结构 */
const getSignBody2 = (ctx) => {
    let str = '';
    for (let attr in ctx.request.query) str += typeof ctx.request.query[attr] === 'object' ? JSON.stringify(ctx.request.query[attr]) : String(ctx.request.query[attr]);
    for (let attr in ctx.request.body) str += typeof ctx.request.body[attr] === 'object' ? JSON.stringify(ctx.request.body[attr]) : String(ctx.request.body[attr]);
    return str;
}

/** 算法：sign = md5( md5(signBody + timestamp) + appSecret ) */
export const getSign = (ctx, appSecret) => md5(md5(getSignBody(ctx) + ctx.headers.timestamp) + appSecret);
export const getSign2 = (ctx, appSecret) => md5(md5(getSignBody2(ctx) + ctx.headers.timestamp) + appSecret);

/** 校验签名（v1），失败时打印调试日志并写入错误响应 */
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

/** 校验签名（v2），失败时打印调试日志并写入错误响应 */
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

// ─── 工具（私有）─────────────────────────────────────────────────────────────

/** 统一设置错误响应 */
const setError = (ctx, status, body) => {
    ctx.response.status = status;
    ctx.response.body = body;
};
