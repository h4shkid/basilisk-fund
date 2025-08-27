import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { description, amount, outcome, profitLoss, notes } = body

    const bet = await prisma.bet.update({
      where: { id },
      data: {
        description,
        amount,
        outcome,
        profitLoss,
        notes
      }
    })

    // If outcome changed to won and there's profit, distribute it
    if (outcome === 'won' && profitLoss > 0) {
      await distributeProfit(profitLoss)
    }

    return NextResponse.json(bet)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.bet.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bet' }, { status: 500 })
  }
}

async function distributeProfit(profit: number) {
  const members = await prisma.member.findMany({
    where: { isActive: true }
  })

  const totalFundSize = members.reduce((acc, member) => acc + member.totalInvested, 0)

  if (totalFundSize === 0) return

  for (const member of members) {
    const percentage = member.totalInvested / totalFundSize
    const memberProfit = profit * percentage

    await prisma.member.update({
      where: { id: member.id },
      data: {
        totalEarnings: {
          increment: memberProfit
        }
      }
    })
  }
}