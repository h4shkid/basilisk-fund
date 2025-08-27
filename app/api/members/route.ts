import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        investments: true,
        payouts: true
      },
      orderBy: {
        totalInvested: 'desc'
      }
    })

    const totalFundSize = members.reduce((acc, member) => acc + member.totalInvested, 0)
    const totalEarnings = members.reduce((acc, member) => acc + member.totalEarnings, 0)

    const membersWithPercentage = members.map(member => ({
      ...member,
      investmentPercentage: totalFundSize > 0 ? (member.totalInvested / totalFundSize) * 100 : 0,
      currentBalance: member.totalInvested + member.totalEarnings - member.totalPayouts
    }))

    return NextResponse.json({
      members: membersWithPercentage,
      stats: {
        totalFundSize,
        totalEarnings,
        activeMembersCount: members.filter(m => m.isActive).length
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, initialInvestment } = body

    const member = await prisma.member.create({
      data: {
        name,
        email,
        totalInvested: initialInvestment || 0
      }
    })

    if (initialInvestment > 0) {
      await prisma.investment.create({
        data: {
          memberId: member.id,
          amount: initialInvestment,
          notes: 'Initial investment'
        }
      })
    }

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}