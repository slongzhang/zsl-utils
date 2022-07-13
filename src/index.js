import pako from 'pako';

import {md5} from './lib/md5';
import {csvToArr, csvToObj} from './lib/csv';
import deepClone from './lib/deepClone';


// 判断是否为空
const isEmpty = (value) => {
  if (null === value) {
      return true;
  } else if (typeof value === 'object') {
    let result = true;
    if (Object.getPrototypeOf(value).hasOwnProperty('entries')) {
      for (let [key, item] of value.entries()) {
        result = false;
        break;
      }
    } else if (value.constructor.hasOwnProperty('entries')) {
      for (let [key, item] of Object.entries(value)) {
        result = false;
        break;
      }
    }
    else if (Object.getPrototypeOf(value).hasOwnProperty("length")){
      result = value.length === 0
    }
    else {
      result = value;
    }
    return result;
  } else if (value == 0) {
    return true;
  } else {
    return !value;
  }
}

// 判断是否json
const isJson = (str) => {
  if (typeof str === 'string') {
    try {
      return JSON.parse(str);
    } catch (e) {}
  }
  return false;
}

// 判断是否数字
const isNum = (value) => {
  return value !== "" && value !== null && !isNaN(value);
}

// 判断是否整型
const isInt = (value) => {
  try {
    return value !== "" && value !== null && !isNaN(value) && value % 1 === 0;
  } catch (error) {}
  return false;
}

// 判断是否浮点型
const isFloat = (value) => {
  // 是否浮点型
  try {
    return value !== "" && value !== null && !isNaN(value) && value % 1 !== 0;
  } catch (error) {}
  return false;
}

// 是否手机号
const isPhone = (value) => {
  return /^1[3456789]\d{9}$/.test(value);
}

// 是否是合法邮箱
const isEmail = (value) => {
  // 常规正则+过滤特殊情况(顶级域名后缀只能是纯字母)
  if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value) && /\.[a-zA-Z]+$/.test(value)) {
    return true;
  }
  return false;
}


// 判断是否普通对象
const isPlainObject = (val) => {
  if (varType(val) !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

// 判断是否数组
const isArray = (val) => {
  return Array.isArray(val);
}



/**
* trim基础函数
* str              String                要处理的原始字符串
* charlist         String                要去除的字符
* type             Integer               去除类型:0两边,1:左边,2右边
.*/
const trimBase = (str, charlist, type = 0) => {
  if (typeof str !== 'string') {
    return str;
  }
  if (typeof charlist === 'undefined') {
    if (type === 1) {
      return str.replace(/^\s+/gm, '');
    } else if (type === 2) {
      return str.replace(/\s+$/gm, '');
    } else {
      return str.replace(/^\s+|\s+$/gm, '');
    }
  }
  charlist = charlist.toString().split('');
  let zy = ['$', '(', ')', '*', '+', '.', '[', ']', '?', '\\', '/', '^', '{', '}', '!', '|'],
    ps = '';
  for (let item of charlist) {
    if (zy.includes(item)) {
      ps += '\\';
    }
    ps += item;
  }
  let reg;
  if (type === 1) {
    reg = new RegExp("\^" + ps + "+", "gm");
  } else if (type === 2) {
    reg = new RegExp(ps + "+$", "gm");
  } else {
    reg = new RegExp("\^" + ps + "+|" + ps + "+$", "gm");
  }
  return str.replace(reg, '');
}

// 移除两侧字符串
const trim = (str, charlist) => {
  return trimBase(str, charlist, 0);
}

// 移除左侧字符
const ltrim = (str, charlist) => {
  return trimBase(str, charlist, 1);
}

// 移除右侧字符
const rtrim = (str, charlist) => {
  return trimBase(str, charlist, 2);
}

// 时间戳获取
const time = (timeType) => {
  let timestemp = Date.now();
  if (timeType) {
    // 返回秒
    timestemp = parseInt(timestemp / 1000);
  }
  return timestemp;
}


// typeof
const varType = (any, toLowerCase = true) => {
  let result = Object.prototype.toString.call(any).slice(8, -1);
  if (toLowerCase) {
    result = result.toLowerCase();
  }
  return result;
}

// 生成随机数
const random = (rangeOrMin, max) => {
  switch (arguments.length) {
    case 1:
      // 如果只要参数1，则参数1表示随机范围的最大
      return parseInt(Math.random() * rangeOrMin + 1, 10);
      break;
    case 2:
      // 如果有两个参数则求这两个的数值范围
      return parseInt(Math.random() * (max - rangeOrMin + 1) + rangeOrMin, 10);
      break;
    default:
      return parseInt(Math.random() * 10); // 没传参数则返回0-9
      break;
  }
}

// 对象转http请求参数
const objToHttpQuery = (value) => {
  let query = [];
  if (value && value.constructor === Object) {
    value = Object.entries(value);
    for (let item of value) {
      if (item[1] && typeof item[1] == 'object') {
        item[1] = JSON.stringify(item[1]);
      }
      let k = item[0],
        v = encodeURIComponent(trimBase(item[1]));
      query.push(k + '=' + v);
    }
  }
  return query.join('&');
}

// httpQuery转对象
const httpQueryToObj = (value) => {
  if (!value) {
    return {};
  }
  let result = {},
    arr = value.split('&');
  for (let item of arr) {
    let key, val, len = item.indexOf('=');
    if (len > 0) {
      key = item.substr(0, len);
      val = decodeURIComponent(item.substr(len + 1));
      result[key] = isJson(val);
      if (result[key] === false) {
        result[key] = val;
      }
    }
  }
  return result;
}



const cookieToObj = (value) => {
  if (value && typeof value == 'string') {
    value = value.split('; ');
  }
  let result = {};
  for (let item of value) {
    let len = item.indexOf('=');
    result[item.substr(0, len)] = item.substr(len + 1);
  }
  return result;
}

// uint8array转base64
const uint8arrayToBase64 = (value) => {
  // 必须定义 binary 二进制
  return Buffer.from(value, 'binary').toString('base64');
}

const base64ToUint8array = (value) => {
  value = Buffer.from(value, 'base64').toString('binary');
  let len = value.length;
  let outputArray = new Uint8Array(len);
  for (var i = 0; i < len; ++i) {
    outputArray[i] = value.charCodeAt(i);
  }
  return outputArray;
}

// pako压缩
const pakoEncode = (value) => {
  if (isEmpty(value)) {
    return '';
  }
  if (typeof value !== 'string') {
    value = JSON.stringify(value);
  }
  let binaryString = pako.deflateRaw(value, {
    to: 'string'
  });
  return uint8arrayToBase64(binaryString);
}

// pako 解压
const pakoDecode = (value) => {
  let result = pako.inflateRaw(base64ToUint8array(value), {
    to: 'string'
  });
  let temp = isJson(result);
  if (temp !== false) {
    result = temp;
  }
  return result;
}

// base64加密
const base64Encode = (value) => {
  if (typeof value === 'undefined') {
    return null;
  }
  return new Buffer(JSON.stringify(value), 'binary').toString('base64');
}

// base64解密
const base64Decode = (value) => {
  value = new Buffer(value, 'base64').toString('binary');
  let temp = isJson(value);
  if (temp !== false) {
    value = temp;
  }
  return value;
}

// 转换请求参数
const queryStringify = (param, json = false) => {
  let dataType = varType(param),
    valueTypes = ['object', 'array', 'string', 'number', 'null', 'undefined', 'boolean'],
    result = {
      query: [],
      json: {}
    };
  switch (dataType) {
    case 'array': {
      Object.values(param).forEach((item, index) => {
        switch (varType(item)) {
          case 'string': {
            item = trim(item); // 移除空格
            if (!!item) {
              result.query.push(item);
              for (let temp of item.split('&')) {
                temp = trim(temp);
                let key, val, len = temp.indexOf('=');
                resul.json[key] = temp.substr(len + 1);
                if (temp = isJson(resul.json[key])) {
                  resul.json[key] = temp;
                }
              }
            }
          }
          break;
          case 'array':
            if (!isEmpty(item[0])) {
              item[1] = isEmpty(item[1]) ? '' : item[1];
              let vType = varType(item[1]);
              if (valueTypes.includes(vType)) {
                result.query.push(item[0] + '=' + encodeURIComponent(['object', 'array'].includes(vType)?JSON.stringify(item[1]): item[1]));
                result.json[item[0]] = item[1];
              }
            }
            break;
          case 'object':
            item.value = isEmpty(item.value) ? '' : item.value;
            if (!isEmpty(item.name)) {
              let vType = varType(item.value);
              if (valueTypes.includes(vType)) {
                result.query.push(item.name + '=' + encodeURIComponent(['object', 'array'].includes(vType)?JSON.stringify(item.value): item.value));
                result.json[item.name] = item.value;
              }
            }
            break;
        }
      })
      result = json ? JSON.stringify(result.json) : result.query.join('&');
    }
    break;
    case 'object': {
      Object.entries(param).forEach(([key, item = ''], index) => {
        let vType = varType(item);
        if (valueTypes.includes(vType)) {
          result.query.push(key + '=' + encodeURIComponent(['object', 'array'].includes(vType)?JSON.stringify(item): item));
          result.json[key] = item;
        }
      })
      result = json ? JSON.stringify(result.json) : result.query.join('&');
    }
    break;
    // case 'string':
    // case 'formdata':
    //   result = param;
    //   break;
    default:
      result = param;
  }
  return result;
}


// base64转成文件流
const base64ToBlob = () => {
  let mime = value.match(/:(.*?);/)[1],
    u8arr = base64ToUint8array(value);
  return new Blob([u8arr], {
    type: mime
  })
}



// 本地文件转base64
const fileToBase64 = (file, callback) => {
  let isFn = typeof callback === 'function';
  switch (varType(file)) {
    case 'filelist':
      file = files[0];
      break;
    case 'file':
      break;
    default:
      return isFn ? callback([false, '请传入文件资源']) : Promise.reject('请求传入文件资源');
  }
  let reader = new FileReader();
  if (isFn) {
    reader.onload = function(e) {
      // target.result 该属性表示目标对象的DataURL
      callback([true, e.target.result, file.name])
    };
    reader.readAsDataURL(file);
  } else {
    return new Promise((resolve, reject) => {
      reader.onload = function(e) {
        // target.result 该属性表示目标对象的DataURL
        resolve({
          result: e.target.result,
          name: file.name
        })
      };
      reader.readAsDataURL(file);
    });
  }
}


// 异步递归循环
const loopAsync = function(taskArr, itemFn) {
  let len = taskArr.length,
    abort = false,
    response = {
      success: {
        len: 0
      },
      error: {
        len: 0
      },
      msg: 'success'
    };
  return new Promise((resolve, reject) => {
    let nextTask = function(index) {
      if (index >= len) {
        return resolve(response) // 执行结束
      } else {
        itemFn(taskArr[index], {
          success(e) {
            // 执行成功调用
            response.success.len++
            response.success[index] = isEmpty(e)? 'ok': e;
          },
          error(e) {
            // 执行失败调用
            response.error.len++
            response.error[index] = isEmpty(e)? 'err': e;
          },
          next() {
            // 执行结束调用-不管成功与否
            if (!abort) {
              if (!response.success.hasOwnProperty(index) && !response.error.hasOwnProperty(index)) {
                response.success[index] = 'ok';
              }
              nextTask(index + 1);
            }
          },
          abort(msg) {
            // 中断
            abort = true;
            response.msg = msg;
            reject(response)
          }
        })
      }
    }
    nextTask(0) // 开始执行
  })
}

// // 使用案例
// loopAsync([1, 2, 3, 4], function(item, fn) {
//     setTimeout(function() {
//         if (item%2== 1) {
//             fn.success() // 触发成功
//         }else {
//             fn.error() // 触发失败回调
//         }
//         if (item > 3) {
//             return fn.abort('手动中止')
//         }
//         fn.next() // 整个异步处理完成
//     }, item * 1000)
// }).then(res => {
//     console.log(res)
// }).catch(err => {})

// // 数组排序
// const arrSort = function(arr, isDesc = true) {
//     let judge = function(x, y){
//         if(x < y){
//             return 1;
//         }else if(x > y){
//             return -1;
//         }else if(x == y){
//             return 0;
//         }
//     }
//     if (isDesc) {
//         arr.sort(judge)
//     }
//     else {
//         arr.sort((x, y) => -judge(x, y));
//     }
//     return arr;
// }

// 对象遍历
const each = function(obj, callback) {
  if (typeof obj === 'object') {
    if (Object.getPrototypeOf(obj).hasOwnProperty('entries')) {
      for (let [key, item] of obj.entries()) {
        if (callback.call(item, key, item) === false) {
          break;
        }
      }
    } else if (obj.constructor.hasOwnProperty('entries')) {
      for (let [key, item] of Object.entries(obj)) {
        if (callback.call(item, key, item) === false) {
          break;
        }
      }
    }
    else if (Object.getPrototypeOf(obj).hasOwnProperty("length")) {
      let key = 0;
      for (let item of obj) {
        if (callback.call(item, key++, item) === false) {
          break;
        }
      }
    }
    return obj;
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge( /* obj1, obj2, obj3, ... */ ) {
  var result = {};

  function assignValue(key, val) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    each(arguments[i], assignValue);
  }
  return result;
}



// 加载后执行
const ready = function(_fn) {
  if (typeof _fn !== 'function') {
    throw 'Fn is not a function!';
  }

  function completed() {
    document.removeEventListener("DOMContentLoaded", completed);
    window.removeEventListener("load", completed);
    _fn();
  }
  if (document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    // Handle it asynchronously to allow scripts the opportunity to delay ready
    window.setTimeout(_fn);
  } else {
    // Use the handy event callback
    document.addEventListener("DOMContentLoaded", completed);
    // A fallback to window.onload, that will always work
    window.addEventListener("load", completed);
  }
}

// 注入远程脚本
const injectJs = (remoteSrc, callback) => {
  if (remoteSrc) {
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.src = remoteSrc;
    script.onload = function() {
      // 放在页面不好看，执行完后移除掉
      this.parentNode.removeChild(this);
      if (typeof(callback) === 'function') {
        callback();
      }
    };
    document.body.appendChild(script);
  }
}


// 注入文本js
const injectJsText = (text, callback, safeMode = true) => {
  if (text) {
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    if (safeMode) { // 默认安全模式添加try防止报错
      text = 'try{' + text + '}catch(err){console.log(err)}'; // 加try防止注入不合法js导致后续代码无法执行
    }
    let textNode = document.createTextNode(text); //声明变量并创建文本内容；
    script.appendChild(textNode);
    document.body.appendChild(script);
    setTimeout(function() {
      // 放在页面不好看，执行完后移除掉
      script.parentNode.removeChild(script);
      if (typeof(callback) === 'function') {
        callback();
      }
    }, 200);
  }
}

/**
* 注入远程css
* remoteSrc            Url            可访问css文件的合法url地址
.*/
const injectCss = function(remoteSrc, attr) {
  if (remoteSrc) {
    let link = document.createElement('link');

    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', remoteSrc);
    link.setAttribute('type', 'text/css');
    link.setAttribute('data-from', 'nmh-crx');
    link.setAttribute('data-time', Date.now());
    if (!isEmpty(attr) && varType(attr) === 'object') {
      // 注入标识,便于识别注入的还是原生的
      attr = Object.entries(attr);
      for (let item of attr) {
        let k = item[0],
          v = item[1];
        if (!isEmpty(k) && !isEmpty(v)) {
          link.setAttribute(k, v);
        }
      }
    }
    document.head.appendChild(link);
  }
}
/**
* 注入本地文本css
* text              本地css文本样式
* [attr]            Object            设置Style标签的属性名,可选
.*/
const injectCssText = function(text, attr) {
  if (text) {
    let style = document.createElement('style');
    // style.setAttribute('data-from', 'nmh-crx');
    style.setAttribute('data-time', Date.now()); // 设置注入时间
    if (!isEmpty(attr) && varType(attr) === 'object') {
      // 注入标识,便于识别注入的还是原生的
      attr = Object.entries(attr);
      for (let item of attr) {
        let k = item[0],
          v = item[1];
        if (!isEmpty(k) && !isEmpty(v)) {
          style.setAttribute(k, v);
        }
      }
    }
    let textNode = document.createTextNode(text); //声明变量并创建文本内容；
    style.appendChild(textNode);
    document.body.appendChild(style);
  }
}

// 合成模板内部函数
const compileHtml = function(template) {
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;
  template = template
    .replace(evalExpr, '`); \n echo( $1 ); \n echo(`')
    .replace(expr, '`); \n $1 \n echo(`');
  template = 'echo(`' + template + '`);';
  let script = `(function parse(data){
      let output = "";
      function echo(html){
          output += html;
      }
      ${ template }
      return output;
  })`;
  return script;
}

/**
 * 模板转换写成全局函数
 * 示例：
 *   let template = `
 *    <ul>
 *    <% for(let i=0; i < data.supplies.length; i++) { %>
 *       <li><%= data.supplies[i] %></li>
 *     <% } %>
 *    </ul>
 *    `;
 *    console.log(zsl.outputHtml(template,{ supplies: [ "broom", "mop", "cleaner" ] }));
 */
const outHtml = function(template, data) {
  if (template) {
    let parse = eval(compileHtml(template));
    return parse(data);
  } else {
    return '';
  }
}

const zsl = {
  isEmpty, // 判断是否为空
  isJson, // 判断是否json
  isNum,
  isInt,
  isFloat,
  isPhone,
  isEmail,
  trim,
  ltrim,
  rtrim,
  time,
  md5,
  pakoEncode,
  pakoDecode,
  base64Encode,
  base64Decode,
  objToHttpQuery,
  httpQueryToObj,
  cookieToObj
  // 变量类型输出
  ,
  varType
  // 变量拷贝
  ,
  deepClone
  // 生成随机数
  ,
  random
  // 转换请求参数
  ,
  queryStringify
  // csv内容转换成数组
  ,
  csvToArr
  // csv内容转换成
  ,
  csvToObj
  // base64转文件流
  ,
  base64ToBlob
  // 文件转base64
  ,
  fileToBase64
  // 异步循环递归（数组递归）
  ,
  loopAsync
  // // js脚本link注入
  // , injectJs
  // // js脚本内容注入
  // , injectTextJs
  // // css样式link注入
  // , injectCss
  // // css内容注入
  // , injectTextCss
  ,
  each,
  isArray,
  isPlainObject,
  merge,
  ready, // dom加载完成后执行
  injectJs, // 注入远程脚本
  injectJsText, // 注入本地脚本
  injectCss,
  injectCssText,
  outHtml, // 转换<% 模板 %>为普通html代码

};

module.exports = zsl;
module.exports.default = zsl;
