exports.getCurrentTime = function () {
  var d = new Date();
  return d.getFullYear() + '-' + prependZero(d.getMonth()) + '-' + prependZero(d.getDate()) + ' ' + prependZero(d.getHours()) + ':' + prependZero(d.getMinutes()) + ':' + prependZero(d.getSeconds());
}

function prependZero(value) {
  return value < 10 ? '0'+value : value;
}

exports.getFormattedAddInfo = function (value, element, type) {
  var fmtStr = value ? value : '-';
  
  if (element === 'answer')
    fmtStr = 'Asnwer ID - ' + fmtStr;
  else if (element === 'question')
    fmtStr = 'Question ID - ' + fmtStr;
  
  if (type === 'search')
    fmtStr = 'Search String - ' + fmtStr;
  
  return fmtStr;
}