import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 清空数据
  await prisma.mouse.deleteMany()
  await prisma.cage.deleteMany()
  await prisma.strain.deleteMany()
  await prisma.userLaboratory.deleteMany()
  await prisma.laboratory.deleteMany()
  await prisma.user.deleteMany()

  // 创建默认实验室
  const defaultLab = await prisma.laboratory.create({
    data: {
      name: '默认实验室',
      description: '系统默认创建的实验室'
    }
  })

  // 创建管理员
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lab.com',
      name: '管理员',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  // 将管理员添加到实验室
  await prisma.userLaboratory.create({
    data: {
      userId: adminUser.id,
      labId: defaultLab.id,
      role: 'ADMIN'
    }
  })

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 12)
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@lab.com',
      name: '实验员',
      password: userPassword,
      role: 'USER'
    }
  })

  // 将普通用户添加到实验室
  await prisma.userLaboratory.create({
    data: {
      userId: normalUser.id,
      labId: defaultLab.id,
      role: 'MEMBER'
    }
  })

  console.log('✅ 数据库初始化完成!')
  console.log('管理员: admin@lab.com / admin123')
  console.log('实验员: user@lab.com / user123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
