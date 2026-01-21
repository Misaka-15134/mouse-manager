import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let openid = body.openid

    // Hybrid support: accept 'code' (legacy) or 'openid' (cloud function)
    if (body.code && !openid) {
       // Legacy jscode2session logic (simplified for brevity, keeping existing flow if needed)
       // For now, we assume frontend sends openid from Cloud Function
       const APPID = process.env.WECHAT_APP_ID
       const SECRET = process.env.WECHAT_APP_SECRET
       if (APPID && SECRET) {
          const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${body.code}&grant_type=authorization_code`
          const wechatRes = await fetch(url)
          const wechatData = await wechatRes.json()
          if (wechatData.openid) openid = wechatData.openid
       }
    }

    if (!openid) {
       return NextResponse.json({ error: 'OpenID is required' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { openid },
      include: {
        laboratories: {
          include: { lab: true }
        }
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          name: '微信用户',
          role: 'USER',
        },
        include: {
          laboratories: {
            include: { lab: true }
          }
        }
      })
    }

    const primaryLab = user.laboratories[0]?.lab

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        laboratoryId: primaryLab?.id,
        laboratoryName: primaryLab?.name
      }
    })

  } catch (error) {
    console.error('WeChat login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
