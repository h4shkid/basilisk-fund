import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { description, amount, outcome, profitLoss, notes, imageUrl } = body

    // Get the current bet to check if outcome changed
    const currentBet = await prisma.bet.findUnique({
      where: { id }
    })

    if (!currentBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    // Reverse the old profit/loss distribution if outcome or amount changed
    if (currentBet.outcome === 'won' && currentBet.profitLoss > 0) {
      await reverseProfit(currentBet.profitLoss)
    } else if (currentBet.outcome === 'lost' && currentBet.profitLoss < 0) {
      await reverseProfit(currentBet.profitLoss)
    }

    const bet = await prisma.bet.update({
      where: { id },
      data: {
        description,
        amount,
        outcome,
        profitLoss,
        notes,
        imageUrl
      }
    })

    // Distribute the new profit/loss
    if (outcome === 'won' && profitLoss > 0) {
      await distributeProfit(profitLoss)
    } else if (outcome === 'lost' && profitLoss < 0) {
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
    // Get the bet first to check if we need to reverse profit distribution
    const bet = await prisma.bet.findUnique({
      where: { id }
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    // Reverse the profit/loss distribution
    if (bet.outcome === 'won' && bet.profitLoss > 0) {
      await reverseProfit(bet.profitLoss)
    } else if (bet.outcome === 'lost' && bet.profitLoss < 0) {
      await reverseProfit(bet.profitLoss)
    }

    // Now delete the bet
    await prisma.bet.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Bet deleted and earnings adjusted' })
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

async function reverseProfit(profit: number) {
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
          decrement: memberProfit
        }
      }
    })
  }
}