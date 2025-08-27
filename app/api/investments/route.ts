import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      include: {
        member: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(investments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, amount, notes } = body

    // Create investment record
    const investment = await prisma.investment.create({
      data: {
        memberId,
        amount,
        notes
      }
    })

    // Update member's total invested
    await prisma.member.update({
      where: { id: memberId },
      data: {
        totalInvested: {
          increment: amount
        }
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 })
  }
}