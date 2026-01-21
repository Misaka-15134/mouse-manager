import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strainId } = await params
    const { cageNumber, groupId, matingDate, notes } = await request.json()

    const cage = await prisma.cage.create({
      data: {
        strainId,
        cageNumber,
        groupId: groupId || null,
        matingDate: matingDate ? new Date(matingDate) : null,
        notes: notes || null
      },
      include: { mice: true }
    })

    return NextResponse.json(cage, { status: 201 })
  } catch (error) {
    console.error('Create cage error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
