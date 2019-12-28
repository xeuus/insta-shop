export function convertNumbers(value: string) {
  let str = value;
  const obj: any = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    '٠': '0',
  };
  Object.keys(obj).forEach((key) => {
    str = replaceString(str, key, obj[key]);
  });
  return str;
}
function replaceString(str: string, search: string, replacement: string) {
  return str.replace(new RegExp(search, 'g'), replacement);
}
