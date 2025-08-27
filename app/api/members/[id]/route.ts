import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        investments: true,
        payouts: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, isActive } = body

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        name,
        email,
        isActive
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete all related records first
    await prisma.investment.deleteMany({
      where: { memberId: params.id }
    })
    
    await prisma.payout.deleteMany({
      where: { memberId: params.id }
    })

    // Then delete the member
    await prisma.member.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}