import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Get all bets that resulted in wins or losses
    const winningBets = await prisma.bet.findMany({
      where: {
        outcome: 'won',
        profitLoss: {
          gt: 0
        }
      }
    })
    
    const losingBets = await prisma.bet.findMany({
      where: {
        outcome: 'lost',
        profitLoss: {
          lt: 0
        }
      }
    })

    // Calculate total profits from wins and losses
    const totalWins = winningBets.reduce((sum, bet) => sum + bet.profitLoss, 0)
    const totalLosses = losingBets.reduce((sum, bet) => sum + bet.profitLoss, 0)
    const totalProfits = totalWins + totalLosses // totalLosses is negative, so this gives net profit

    // Get all members
    const members = await prisma.member.findMany()
    
    // Calculate total fund size
    const totalFundSize = members.reduce((sum, member) => sum + member.totalInvested, 0)

    if (totalFundSize === 0) {
      return NextResponse.json({ 
        message: 'No investments found',
        totalProfits: 0,
        updates: []
      })
    }

    // Reset all members' earnings and recalculate based on actual winning bets
    const updates = []
    
    for (const member of members) {
      const percentage = member.totalInvested / totalFundSize
      const correctEarnings = totalProfits * percentage
      
      // Update member's earnings to the correct amount
      await prisma.member.update({
        where: { id: member.id },
        data: {
          totalEarnings: correctEarnings
        }
      })
      
      updates.push({
        memberId: member.id,
        memberName: member.name,
        previousEarnings: member.totalEarnings,
        correctEarnings,
        difference: correctEarnings - member.totalEarnings
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Earnings recalculated successfully',
      totalWins,
      totalLosses,
      netProfits: totalProfits,
      totalFundSize,
      updates
    })
  } catch (error) {
    console.error('Recalculation error:', error)
    return NextResponse.json({ 
      error: 'Failed to recalculate earnings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Reset all earnings to zero
export async function DELETE() {
  try {
    await prisma.member.updateMany({
      data: {
        totalEarnings: 0
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'All earnings reset to zero'
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ 
      error: 'Failed to reset earnings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}