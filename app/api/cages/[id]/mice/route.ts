import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cageId } = await params
    const { sex, quantity, genotype, dob, notes } = await request.json()

    const mouse = await prisma.mouse.create({
      data: {
        cageId,
        sex: sex || 'UNKNOWN',
        quantity: quantity || 1,
        genotype: genotype || null,
        dob: dob ? new Date(dob) : null,
        notes: notes || null
      }
    })

    return NextResponse.json(mouse, { status: 201 })
  } catch (error) {
    console.error('Create mouse error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
