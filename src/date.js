/**
 * 格式化日期
 * @param {Date} date - 日期对象，默认为当前时间
 * @param {string} fmt - 格式字符串，默认 'yyyy-MM-dd hh:mm:ss'
 * @returns {string}
 * @example
 * formatDate(new Date(), 'yyyy-MM-dd') // '2024-01-01'
 */
export const formatDate = (date = new Date(), fmt = 'yyyy-MM-dd hh:mm:ss') => {
    let o = {
        "M+": date.getMonth() + 1, // 月份
        "d+": date.getDate(),       // 日
        "h+": date.getHours(),      // 小时
        "m+": date.getMinutes(),    // 分
        "s+": date.getSeconds(),    // 秒
        "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
        "S": date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/**
 * 获取日期所在年份的第几周
 * @param {Date} date - 日期对象
 * @returns {number}
 */
export const getWeek = (date) => {
    let date_1 = new Date(date.getFullYear(), 0, 1);
    let day_1 = date_1.getDay();
    if (!day_1) day_1 = 7;
    let d = Math.ceil((date - date_1) / (24 * 60 * 60 * 1000));
    return Math.ceil((d + day_1 - 1) / 7);
}

/**
 * 获取日期所在周的描述字符串（周数 + 周一到周日日期范围）
 * @param {Date} date - 日期对象
 * @returns {string} 格式如 "3:2024-01-15>2024-01-21"
 */
export const getWeekString = (date) => {
    let day = date.getDay();
    if (!day) day = 7;
    let date_monday = new Date(date);
    date_monday.setDate(date.getDate() - day + 1);
    let date_monday_str = formatDate(date_monday, 'yyyy-MM-dd');
    let date_sunday = new Date(date_monday);
    date_sunday.setDate(date_monday.getDate() + 6);
    let date_sunday_str = formatDate(date_sunday, 'yyyy-MM-dd');
    let week = getWeek(date);
    return `${week}:${date_monday_str}>${date_sunday_str}`;
}
