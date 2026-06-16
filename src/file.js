import fs from 'fs';
import path from 'path';

/**
 * 递归创建文件夹
 * @param {string} dirpath - 将创建的目录路径
 * @param {number} mode - 目录权限（读写权限），默认 0o777
 * @param {Function} callback - 回调，传递异常参数 err
 */
export function mkdirs(dirpath, mode, callback) {
    fs.exists(dirpath, function (exists) {
        if (exists) {
            callback(dirpath);
        } else {
            // 尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function () {
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
}

/**
 * 读取文件内容
 * @param {string} filename - 文件路径
 * @param {string} coding - 编码格式，默认 'utf8'
 * @returns {Promise<string>}
 */
export const readFile = (filename, coding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, coding, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

/**
 * 写入文件内容
 * @param {string} filename - 文件路径
 * @param {string} data - 写入内容，默认空字符串
 * @param {object} options - 选项，默认 { flag: 'w' }
 * @returns {Promise<void>}
 */
export const writeFile = (filename, data = '', options = {flag: 'w'}) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, options, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

/**
 * 追加写入文件内容
 * @param {string} filename - 文件路径
 * @param {string} data - 追加内容，默认空字符串
 * @param {object} options - 选项，默认 { flag: 'a' }
 * @returns {Promise<void>}
 */
export const appendFile = (filename, data = '', options = {flag: 'a'}) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, options, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

/**
 * 遍历指定文件夹下的文件（非递归）
 * @param {string} filepath - 目录路径
 * @returns {Promise<string[]>} 文件绝对路径列表
 * @example
 * readDir(path.resolve('./config'))
 */
export const readDir = (filepath) => {
    return new Promise((resolve, reject) => {
        fs.readdir(filepath, function (err, files) {
            if (err) return reject(err);
            let list = [];
            for (let filename of files) list.push(path.resolve(filepath, filename));
            resolve(list);
        });
    });
}

/**
 * 同步遍历指定文件夹下的文件（非递归）
 * @param {string} filepath - 目录路径
 * @returns {string[]} 文件绝对路径列表
 */
export const readDirSync = filepath => {
    let files = fs.readdirSync(filepath);
    let list = [];
    for (let filename of files) list.push(path.resolve(filepath, filename));
    return list;
}

/**
 * 递归遍历文件夹下所有文件
 * @param {string} filepath - 目录路径
 * @returns {Promise<string[]>} 所有文件绝对路径列表
 * @example
 * readDirs(path.resolve('./config'))
 */
export const readDirs = (filepath) => {
    let list = [];
    let dir_number = 1;
    let dir_counter = 0;

    function fileDisplay(filepath, callback) {
        fs.readdir(filepath, function (err, files) {
            dir_counter++;
            if (err) return callback(err);
            for (let filename of files) {
                let file = path.resolve(filepath, filename);
                let stats = fs.statSync(file);
                if (stats.isFile()) list.push(file);
                if (stats.isDirectory()) {
                    dir_number++;
                    fileDisplay(file, callback);
                }
            }
            if (dir_counter === dir_number) callback(null, list);
        });
    }

    return new Promise((resolve, reject) => {
        fileDisplay(filepath, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

/**
 * 同步递归遍历文件夹下所有文件
 * @param {string} filepath - 目录路径
 * @returns {string[]} 所有文件绝对路径列表
 */
export const readDirsSync = filepath => {
    let list = [];
    let dir_number = 1;
    let dir_counter = 0;

    function fileDisplaySync(filepath) {
        let files = fs.readdirSync(filepath);
        dir_counter++;
        for (let filename of files) {
            let file = path.resolve(filepath, filename);
            let stats = fs.statSync(file);
            if (stats.isFile()) list.push(file);
            if (stats.isDirectory()) {
                dir_number++;
                fileDisplaySync(file);
            }
        }
        if (dir_counter === dir_number) return list;
    }

    return fileDisplaySync(filepath);
}

/**
 * 判断路径是否为目录
 * @param {string} filepath - 路径
 * @returns {boolean}
 */
export const isDirectory = filepath => {
    return fs.statSync(filepath).isDirectory();
}

/**
 * 判断文件或目录是否存在
 * @param {string} filepath - 路径
 * @returns {boolean}
 */
export const exists = filepath => {
    return fs.existsSync(filepath);
}
