import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // 验证输入
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '缺少必要字段：邮箱、密码或姓名' }, 
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户已存在' }, 
        { status: 409 }
      )
    }

    // 对密码进行哈希
    const hashedPassword = await hashPassword(password)

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // 为新用户创建默认实验室
    const defaultLab = await prisma.laboratory.create({
      data: {
        name: `${name}的实验室`,
        description: `${name}创建的个人实验室`
      }
    })

    // 将用户与默认实验室关联
    await prisma.userLaboratory.create({
      data: {
        userId: user.id,
        labId: defaultLab.id,
        role: 'ADMIN'
      }
    })

    // 返回成功响应，但不包含密码
    return NextResponse.json({
      message: '用户注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '服务器错误' }, 
      { status: 500 }
    )
  }
}