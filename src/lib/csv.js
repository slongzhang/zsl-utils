// csv 字符串转数组
// as => csvToArr('a,b,c\r\n1,2,3\r\n4,5,6\r\n') => [["a","b","c"],["1","2","3"],["4","5","6"]]
export const csvToArr = (strData, strDelimiter) => {
  // Check to see if the delimiter is defined. If not,then default to comma.
  // 检查是否定义了分隔符。如果未定义，则默认为逗号
  strDelimiter = (strDelimiter || ",");
  // Create a regular expression to parse the CSV values.
  // 创建一个正则表达式来解析CSV值。
  let objPattern = new RegExp((
    // Delimiters.(分隔符)
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.(引用的字段)
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.(标准字段)
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  // Create an array to hold our data. Give the array a default empty first row.
  // 创建一个数组来保存数据。给数组赋值一个空元素数组
  let arrData = [
    []
  ];
  // Create an array to hold our individual pattern matching groups.
  // 创建一个数组来保存我们的单个模式匹配组
  let arrMatches = null;
  // Keep looping over the regular expression matches until we can no longer find a match.
  // 正则表达式匹配上保持循环,直到我们再也找不到匹配的
  while (arrMatches = objPattern.exec(strData)) {
    // Get the delimiter that was found.
    // 获取找到的分隔符
    let strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // 检查给定的分隔符是否有长度
    // (is not the start of string) and if it matches
    // （不是字符串的开头）如果匹配
    // field delimiter. If id does not, then we know
    // 字段分隔符。如果身份证没有，那我们就知道了
    // that this delimiter is a row delimiter.
    // 此分隔符是行分隔符。
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
      // Since we have reached a new row of data,add an empty row to our data array.
      // 既然我们得到了新的一行数据，向数据数组中添加一个空行。
      arrData.push([]);
    }
    // Now that we have our delimiter out of the way,
    // 既然我们已经把分隔符弄出来了，
    // let's check to see which kind of value we
    // 让我们来看看我们需要什么样的价值观
    // captured (quoted or unquoted).
    // 捕获（引用或未引用）。
    let strMatchedValue;
    if (arrMatches[2]) {
      // We found a quoted value. When we capture this value, unescape any double quotes.
      // 我们找到一个引用值。当我们抓到这个值，取消显示任何双引号
      strMatchedValue = arrMatches[2].replace(
        new RegExp("\"\"", "g"), "\"");
    } else {
      // We found a non-quoted value.
      // 我们找到了一个没有引号的值。
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add it to the data array.
    // 现在我们有了值字符串，让我们将其添加到数据数组中
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // 移除最后一个空数据
  arrData.splice(-1);

  // Return the parsed data.
  // 返回解析结果
  return (arrData);
}

// csv 字符串转对象
// as => csvToObj('a,b,c\r\n1,2,3\r\n4,5,6\r\n') => [{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]
export const csvToObj = (csv) => {
  let array = csvToArr(csv);
  let objArray = [];
  for (let i = 1; i < array.length; i++) {
    objArray[i - 1] = {};
    for (let k = 0; k < array[0].length && k < array[i].length; k++) {
      let key = array[0][k];
      objArray[i - 1][key] = array[i][k]
    }
  }
  return objArray;
}





export default {
  csvToArr
  , csvToObj
}