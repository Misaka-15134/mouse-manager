import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const strain = await prisma.strain.findUnique({
      where: { id },
      include: {
        cages: {
          include: { mice: true },
          orderBy: { cageNumber: 'asc' }
        },
        laboratory: true
      }
    })

    if (!strain) {
      return NextResponse.json({ error: '品系不存在' }, { status: 404 })
    }

    return NextResponse.json(strain)
  } catch (error) {
    console.error('Get strain error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.strain.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete strain error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
