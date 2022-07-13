// modified from: https://github.com/ConardLi/ConardLi.github.io/blob/master/demo/deepClone/src/clone_6.js
// discussion at: https://segmentfault.com/a/1190000020255831
// what has changed: use loop instead of recursion

const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const argsTag = '[object Arguments]';

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag];


function forEach(array, iteratee) {
  let index = -1;
  const length = array.length;
  while (++index < length) {
    iteratee(array[index], index);
  }
  return array;
}

function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

function getType(target) {
  return Object.prototype.toString.call(target);
}

function getInit(target) {
  const Ctor = target.constructor;
  return new Ctor();
}

function cloneSymbol(targe) {
  return Object(Symbol.prototype.valueOf.call(targe));
}

function cloneReg(targe) {
  const reFlags = /\w*$/;
  const result = new targe.constructor(targe.source, reFlags.exec(targe));
  result.lastIndex = targe.lastIndex;
  return result;
}

// 拷贝函数-不拷贝
function cloneFunction(func) {
  return func;
  // const bodyReg = /(?<={)(.|\n)+(?=})/m;
  // const paramReg = /(?<=\().+(?=\)\s+{)/;
  // const funcString = func.toString();
  // if (func.prototype) {
  //   const param = paramReg.exec(funcString);
  //   const body = bodyReg.exec(funcString);
  //   if (body) {
  //     if (param) {
  //       const paramArr = param[0].split(',');
  //       return new Function(...paramArr, body[0]);
  //     } else {
  //       return new Function(body[0]);
  //     }
  //   } else {
  //     return null;
  //   }
  // } else {
  //   return eval(funcString);
  // }
}

function cloneOtherType(targe, type) {
  const Ctor = targe.constructor;
  switch (type) {
    case boolTag:
      return targe?true: false;
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(targe);
    case regexpTag:
      return cloneReg(targe);
    case symbolTag:
      return cloneSymbol(targe);
    case funcTag:
      return cloneFunction(targe);
    default:
      return null;
  }
}

function clone(target) {
  let result = null;
  let cloneQueue = [{
    t: target,
    done: res => result = res
  }];

  let map = new WeakMap();

  while (cloneQueue.length > 0) {
    let {
      t,
      done
    } = cloneQueue.shift();

    // 克隆原始类型
    if (!isObject(t)) {
      done(t);
      continue;
    }

    // 初始化
    const type = getType(t);
    let cloneTarget;

    if (!deepTag.includes(type)) {
      done(cloneOtherType(t, type));
      continue;
    }

    cloneTarget = getInit(t, type);

    // 防止循环引用
    if (map.get(t)) {
      done(map.get(t));
      continue;
    }


    switch (type) {
      case setTag:
        // 克隆set
        t.forEach(value => {
          // cloneTarget.add(clone(value));
          cloneQueue.push({
            t: value,
            done: res => cloneTarget.add(res)
          });
        });
        break;
      case mapTag:
        // 克隆map
        t.forEach((value, key) => {
          // cloneTarget.set(key, clone(value));
          cloneQueue.push({
            t: value,
            done: res => cloneTarget.set(key, res)
          });
        });
        break;
      default:
        // 克隆对象和数组
        const keys = type === arrayTag ? undefined : Object.keys(t);
        forEach(keys || t, (value, key) => {
          if (keys) {
            key = value;
          }
          // cloneTarget[key] = clone(t[key], map);
          cloneQueue.push({
            t: t[key],
            done: res => cloneTarget[key] = res
          });
        });
        break;
    }

    map.set(t, cloneTarget);

    done(cloneTarget);
  }

  return result;
}

export default clone;