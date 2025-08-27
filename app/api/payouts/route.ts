import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        member: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(payouts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, amount, notes } = body

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        memberId,
        amount,
        notes
      }
    })

    // Update member's total payouts
    await prisma.member.update({
      where: { id: memberId },
      data: {
        totalPayouts: {
          increment: amount
        }
      }
    })

    return NextResponse.json(payout)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 })
  }
}