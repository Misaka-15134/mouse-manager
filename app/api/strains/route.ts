import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 从请求头或cookie中获取用户信息，这里简化为获取实验室ID
    // 在实际应用中，应该通过JWT或Session验证用户身份
    
    // 获取所有品系（实际应用中应该限制为用户所属实验室的品系）
    const strains = await prisma.strain.findMany({
      include: {
        _count: { select: { cages: true } },
        laboratory: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(strains)
  } catch (error) {
    console.error('Get strains error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, laboratoryId } = await request.json()
    
    // 验证实验室ID是否存在
    const lab = await prisma.laboratory.findUnique({
      where: { id: laboratoryId }
    })
    
    if (!lab) {
      return NextResponse.json({ error: '实验室不存在' }, { status: 404 })
    }
    
    const strain = await prisma.strain.create({
      data: { 
        name,
        laboratoryId
      },
      include: { laboratory: true }
    })

    return NextResponse.json(strain, { status: 201 })
  } catch (error) {
    console.error('Create strain error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
