const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '..', '..', '小鼠信息汇总251202.xlsx'));

console.log('=== Excel 文件分析 ===\n');
console.log('所有Sheet名称:', workbook.SheetNames);
console.log('');

workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n=== Sheet ${index + 1}: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log('行数:', data.length);
  if (data.length > 0) {
    console.log('表头:', data[0]);
    console.log('前5行数据:');
    data.slice(1, 6).forEach((row, i) => {
      console.log(`  ${i + 1}:`, row);
    });
  }
});
