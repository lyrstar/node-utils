# @lyrstar/node-utils

Node.js 常用工具函数库

## 安装

```bash
npm install @lyrstar/node-utils
```

## 使用

### 全量导入

```js
import {md5, enBase64, formatDate, createToken, authentication} from '@lyrstar/node-utils';
```

### 按模块导入

```js
import {enBase64, deBase64} from '@lyrstar/node-utils/base64';
import {md5} from '@lyrstar/node-utils/crypto';
import {string10to62, string62to10} from '@lyrstar/node-utils/string';
import {getRequestIp, getIPAddress} from '@lyrstar/node-utils/net';
import {formatDate, getWeek, getWeekString} from '@lyrstar/node-utils/date';
import {
    mkdirs,
    readFile,
    writeFile,
    appendFile,
    readDir,
    readDirSync,
    readDirs,
    readDirsSync,
    isDirectory,
    exists
} from '@lyrstar/node-utils/file';
import {createToken} from '@lyrstar/node-utils/token';
import {authentication} from '@lyrstar/node-utils/filter';
```

---

## API

### Base64 (`@lyrstar/node-utils/base64`)

#### `enBase64(str)`

Base64 编码。

| 参数  | 类型     | 说明     |
|-----|--------|--------|
| str | string | 待编码字符串 |

**返回值：** `string`

```js
enBase64('hello world'); // 'aGVsbG8gd29ybGQ='
```

#### `deBase64(str)`

Base64 解码。

| 参数  | 类型     | 说明     |
|-----|--------|--------|
| str | string | 待解码字符串 |

**返回值：** `string`

```js
deBase64('aGVsbG8gd29ybGQ='); // 'hello world'
```

---

### Crypto (`@lyrstar/node-utils/crypto`)

#### `md5(str)`

生成字符串的 MD5 哈希值。

| 参数  | 类型     | 说明     |
|-----|--------|--------|
| str | string | 待哈希字符串 |

**返回值：** `string`

```js
md5('hello'); // '5d41402abc4b2a76b9719d911017c592'
```

---

### String (`@lyrstar/node-utils/string`)

#### `string10to62(number)`

将 10 进制整数转换为 62 进制字符串。

| 参数     | 类型     | 说明      |
|--------|--------|---------|
| number | number | 10 进制整数 |

**返回值：** `string`

```js
string10to62(12345); // '3lp'
```

#### `string62to10(string)`

将 62 进制字符串转换为 10 进制整数。

| 参数     | 类型     | 说明       |
|--------|--------|----------|
| string | string | 62 进制字符串 |

**返回值：** `number`

```js
string62to10('3lp'); // 12345
```

---

### Net (`@lyrstar/node-utils/net`)

#### `getRequestIp(req)`

从 HTTP 请求对象中获取客户端真实 IP（兼容代理转发）。

| 参数  | 类型     | 说明        |
|-----|--------|-----------|
| req | object | HTTP 请求对象 |

**返回值：** `string`

#### `getIPAddress()`

获取本机局域网 IPv4 地址。

**返回值：** `string | undefined`

```js
getIPAddress(); // '192.168.1.100'
```

---

### Date (`@lyrstar/node-utils/date`)

#### `formatDate(date?, fmt?)`

格式化日期。

| 参数   | 类型     | 默认值                     | 说明    |
|------|--------|-------------------------|-------|
| date | Date   | `new Date()`            | 日期对象  |
| fmt  | string | `'yyyy-MM-dd hh:mm:ss'` | 格式字符串 |

**格式占位符：**

| 占位符  | 说明 |
|------|----|
| yyyy | 年份 |
| MM   | 月份 |
| dd   | 日  |
| hh   | 小时 |
| mm   | 分钟 |
| ss   | 秒  |
| S    | 毫秒 |

**返回值：** `string`

```js
formatDate(new Date(), 'yyyy-MM-dd');           // '2024-06-16'
formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');  // '2024-06-16 10:30:00'
```

#### `getWeek(date)`

获取日期所在年份的第几周。

| 参数   | 类型   | 说明   |
|------|------|------|
| date | Date | 日期对象 |

**返回值：** `number`

```js
getWeek(new Date('2024-06-16')); // 24
```

#### `getWeekString(date)`

获取日期所在周的描述字符串（周数 + 日期范围）。

| 参数   | 类型   | 说明   |
|------|------|------|
| date | Date | 日期对象 |

**返回值：** `string`，格式为 `"周数:周一日期>周日日期"`

```js
getWeekString(new Date('2024-06-16')); // '24:2024-06-10>2024-06-16'
```

---

### File (`@lyrstar/node-utils/file`)

#### `mkdirs(dirpath, mode, callback)`

递归创建文件夹（含所有父级目录）。

| 参数       | 类型       | 说明                 |
|----------|----------|--------------------|
| dirpath  | string   | 待创建的目录路径           |
| mode     | number   | 目录权限，如 `0o777`     |
| callback | Function | 完成回调，参数为创建的目录路径或错误 |

```js
mkdirs('/path/to/deep/dir', 0o777, (err) => {
    if (err) console.error(err);
    else console.log('目录创建成功');
});
```

#### `readFile(filename, coding?)`

Promise 方式读取文件内容。

| 参数       | 类型     | 默认值      | 说明   |
|----------|--------|----------|------|
| filename | string |          | 文件路径 |
| coding   | string | `'utf8'` | 编码格式 |

**返回值：** `Promise<string>`

```js
const content = await readFile('./data.txt');
```

#### `writeFile(filename, data?, options?)`

Promise 方式写入文件（覆盖模式）。

| 参数       | 类型     | 默认值             | 说明   |
|----------|--------|-----------------|------|
| filename | string |                 | 文件路径 |
| data     | string | `''`            | 写入内容 |
| options  | object | `{ flag: 'w' }` | 写入选项 |

**返回值：** `Promise<void>`

```js
await writeFile('./data.txt', 'hello world');
```

#### `appendFile(filename, data?, options?)`

Promise 方式追加写入文件。

| 参数       | 类型     | 默认值             | 说明   |
|----------|--------|-----------------|------|
| filename | string |                 | 文件路径 |
| data     | string | `''`            | 追加内容 |
| options  | object | `{ flag: 'a' }` | 写入选项 |

**返回值：** `Promise<void>`

```js
await appendFile('./data.txt', '\nnew line');
```

#### `readDir(filepath)`

Promise 方式遍历指定目录下的文件（非递归）。

| 参数       | 类型     | 说明   |
|----------|--------|------|
| filepath | string | 目录路径 |

**返回值：** `Promise<string[]>` 文件绝对路径列表

```js
const files = await readDir('./config');
```

#### `readDirSync(filepath)`

同步遍历指定目录下的文件（非递归）。

| 参数       | 类型     | 说明   |
|----------|--------|------|
| filepath | string | 目录路径 |

**返回值：** `string[]`

```js
const files = readDirSync('./config');
```

#### `readDirs(filepath)`

Promise 方式递归遍历目录下所有文件。

| 参数       | 类型     | 说明   |
|----------|--------|------|
| filepath | string | 目录路径 |

**返回值：** `Promise<string[]>` 所有文件绝对路径列表

```js
const files = await readDirs('./src');
```

#### `readDirsSync(filepath)`

同步递归遍历目录下所有文件。

| 参数       | 类型     | 说明   |
|----------|--------|------|
| filepath | string | 目录路径 |

**返回值：** `string[]`

```js
const files = readDirsSync('./src');
```

#### `isDirectory(filepath)`

判断路径是否为目录。

| 参数       | 类型     | 说明 |
|----------|--------|----|
| filepath | string | 路径 |

**返回值：** `boolean`

```js
isDirectory('./src'); // true
```

#### `exists(filepath)`

判断文件或目录是否存在。

| 参数       | 类型     | 说明 |
|----------|--------|----|
| filepath | string | 路径 |

**返回值：** `boolean`

```js
exists('./src/file.js'); // true
```

---

### Token (`@lyrstar/node-utils/token`)

#### `createToken()`

生成基于时间戳和随机数的 Token 字符串。

**返回值：** `string`

```js
createToken(); // 'lrz8k4f2a8b'
```

---

### Filter (`@lyrstar/node-utils/filter`)

#### `authentication(ctx, next, options)`

Koa 鉴权中间件，依次校验请求头参数、AppId、时间戳及签名。

**签名算法（v1）**

```
sign = md5( md5(queryValues + bodyValues + timestamp) + appSecret )
```

**签名算法（v2，对象类型字段做 JSON.stringify）**

```
sign = md5( md5(JSON.stringify(queryValues) + JSON.stringify(bodyValues) + timestamp) + appSecret )
```

**请求头必填字段：**

| 字段        | 说明              |
|-----------|-----------------|
| appid     | 应用 ID           |
| timestamp | 时间戳（毫秒），与服务器偏差不超过 10 分钟 |
| sign      | 签名字符串           |

**options 参数：**

| 参数          | 类型      | 默认值 | 说明                            |
|-------------|---------|-----|-------------------------------|
| NODE_ENV    | string  | —   | 运行环境，非 `'pro'` 时 appid 为 `'appId'` 可直接放行 |
| auth        | boolean | —   | `false` 时跳过鉴权直接放行              |
| APPS        | object  | —   | `{ [appId]: { appSecret } }` 映射表 |
| version     | number  | `1` | 签名算法版本，`1` 或 `2`              |

**错误响应：**

| 状态码 | 原因       |
|-----|----------|
| 421 | 请求头缺少必填参数 |
| 422 | 时间戳超出允许范围 |
| 423 | 签名错误     |
| 500 | AppId 未注册 |

```js
import Koa from 'koa';
import {authentication} from '@lyrstar/node-utils/filter';

const app = new Koa();

const APPS = {
    myAppId: { appSecret: 'mySecret' }
};

app.use((ctx, next) => authentication(ctx, next, {
    NODE_ENV: process.env.NODE_ENV,
    auth: true,
    APPS,
    version: 2
}));
```

---

## License

[MIT](./LICENSE)
