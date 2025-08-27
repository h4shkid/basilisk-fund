import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bets = await prisma.bet.findMany({
      orderBy: {
        datePlaced: 'desc'
      }
    })

    const wonBets = bets.filter(b => b.outcome === 'won')
    const lostBets = bets.filter(b => b.outcome === 'lost')
    const decidedBets = bets.filter(b => b.outcome !== 'pending')
    
    const stats = {
      totalBets: bets.length,
      totalWinnings: wonBets.reduce((acc, bet) => acc + bet.profitLoss, 0),
      totalLosses: Math.abs(lostBets.reduce((acc, bet) => acc + bet.profitLoss, 0)),
      pendingBets: bets.filter(b => b.outcome === 'pending').length,
      winRate: decidedBets.length > 0 
        ? (wonBets.length / decidedBets.length) * 100
        : 0
    }

    return NextResponse.json({ bets, stats })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bet = await prisma.bet.create({
      data: body
    })

    if (bet.outcome === 'won' && bet.profitLoss > 0) {
      await distributeProfit(bet.profitLoss)
    }

    return NextResponse.json(bet)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 })
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