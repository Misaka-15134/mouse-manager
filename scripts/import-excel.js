const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Excel日期序列号转JS日期
function excelDateToJS(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') return null;
  // Excel日期从1900年1月1日开始，但有一个闰年bug
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(date.getTime()) ? null : date;
}

// 解析性别
function parseSex(sexStr) {
  if (!sexStr) return 'UNKNOWN';
  const s = String(sexStr).trim();
  if (s === '♂' || s.includes('雄') || s.toLowerCase() === 'm' || s.toLowerCase() === 'male') return 'MALE';
  if (s === '♀' || s.includes('雌') || s.toLowerCase() === 'f' || s.toLowerCase() === 'female') return 'FEMALE';
  if (s === '子代' || s.includes('子代')) return 'UNKNOWN';
  return 'UNKNOWN';
}

// 解析数量
function parseQuantity(qty) {
  if (!qty) return 1;
  const s = String(qty).trim();
  if (s.includes('窝')) return 1; // "1窝" 等
  const num = parseInt(s);
  return isNaN(num) ? 1 : num;
}

async function importExcel() {
  const excelPath = path.join(__dirname, '..', '..', '小鼠信息汇总251202.xlsx');
  const workbook = XLSX.readFile(excelPath);

  console.log('开始导入数据...\n');
  console.log('找到', workbook.SheetNames.length, '个品系(Sheet)');

  // 清空现有数据
  console.log('\n清空现有数据...');
  await prisma.mouse.deleteMany();
  await prisma.cage.deleteMany();
  await prisma.strain.deleteMany();
  await prisma.user.deleteMany();

  // 创建管理员账户
  console.log('创建管理员账户...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@lab.com',
      name: '管理员',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  let totalCages = 0;
  let totalMice = 0;

  for (const sheetName of workbook.SheetNames) {
    console.log(`\n处理品系: ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) {
      console.log('  跳过（无数据）');
      continue;
    }

    // 创建品系
    const strain = await prisma.strain.create({
      data: { name: sheetName }
    });

    const headers = data[0];
    // 找到各列的索引
    const cageCol = headers.findIndex(h => h && (String(h).includes('笼号') || String(h).includes('笼')));
    const groupCol = headers.findIndex(h => h && String(h).includes('总编号'));
    const sexCol = headers.findIndex(h => h && String(h).includes('性别'));
    const qtyCol = headers.findIndex(h => h && String(h).includes('数量'));
    const genotypeCol = headers.findIndex(h => h && String(h).includes('鉴定'));
    const dobCol = headers.findIndex(h => h && String(h).includes('出生'));
    const matingCol = headers.findIndex(h => h && String(h).includes('配笼'));
    const notesCol = headers.findIndex(h => h && String(h).includes('备注'));

    let currentCageNumber = null;
    let currentCageId = null;
    let cagesInStrain = 0;
    let miceInStrain = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // 获取笼号
      const cageNumber = cageCol >= 0 ? row[cageCol] : null;
      
      // 如果有新笼号，创建新笼位
      if (cageNumber && String(cageNumber).trim()) {
        currentCageNumber = String(cageNumber).trim();
        
        const groupId = groupCol >= 0 ? row[groupCol] : null;
        const matingDate = matingCol >= 0 ? excelDateToJS(row[matingCol]) : null;
        const notes = notesCol >= 0 ? row[notesCol] : null;

        try {
          const cage = await prisma.cage.create({
            data: {
              strainId: strain.id,
              cageNumber: currentCageNumber,
              groupId: groupId ? String(groupId).trim() : null,
              matingDate: matingDate,
              notes: notes ? String(notes).trim() : null
            }
          });
          currentCageId = cage.id;
          cagesInStrain++;
        } catch (e) {
          // 笼号重复，跳过
          console.log(`  警告: 笼位 ${currentCageNumber} 已存在，跳过`);
          currentCageId = null;
          continue;
        }
      }

      // 如果没有当前笼位，跳过
      if (!currentCageId) continue;

      // 解析小鼠数据
      const sex = sexCol >= 0 ? parseSex(row[sexCol]) : 'UNKNOWN';
      const quantity = qtyCol >= 0 ? parseQuantity(row[qtyCol]) : 1;
      const genotype = genotypeCol >= 0 && row[genotypeCol] ? String(row[genotypeCol]).trim() : null;
      const dob = dobCol >= 0 ? excelDateToJS(row[dobCol]) : null;
      const mouseNotes = notesCol >= 0 && !cageNumber ? (row[notesCol] ? String(row[notesCol]).trim() : null) : null;

      // 跳过空行或无效数据
      if (!row[sexCol] && !row[qtyCol] && !row[genotypeCol]) continue;

      // 创建小鼠记录
      try {
        await prisma.mouse.create({
          data: {
            cageId: currentCageId,
            sex: sex,
            quantity: quantity,
            genotype: genotype,
            dob: dob,
            notes: mouseNotes
          }
        });
        miceInStrain++;
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`  创建了 ${cagesInStrain} 个笼位, ${miceInStrain} 条小鼠记录`);
    totalCages += cagesInStrain;
    totalMice += miceInStrain;
  }

  console.log('\n========== 导入完成 ==========');
  console.log(`品系总数: ${workbook.SheetNames.length}`);
  console.log(`笼位总数: ${totalCages}`);
  console.log(`小鼠记录: ${totalMice}`);
  console.log('\n管理员账户: admin@lab.com / admin123');
}

importExcel()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
