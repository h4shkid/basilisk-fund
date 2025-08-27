import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst()
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin already exists',
        email: existingAdmin.email 
      })
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@basiliskfund.com',
        password: hashedPassword,
        name: 'Admin User'
      }
    })

    // Create sample members if none exist
    const memberCount = await prisma.member.count()
    
    if (memberCount === 0) {
      await prisma.member.createMany({
        data: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            totalInvested: 5000,
            totalEarnings: 1250,
            totalPayouts: 500,
            isActive: true
          },
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            totalInvested: 10000,
            totalEarnings: 2500,
            totalPayouts: 1000,
            isActive: true
          },
          {
            name: 'Mike Johnson',
            email: 'mike@example.com',
            totalInvested: 7500,
            totalEarnings: 1875,
            totalPayouts: 0,
            isActive: true
          }
        ]
      })
    }

    // Create sample bets if none exist
    const betCount = await prisma.bet.count()
    
    if (betCount === 0) {
      await prisma.bet.createMany({
        data: [
          {
            description: 'Lakers vs Celtics - Lakers to win',
            amount: 500,
            outcome: 'won',
            profitLoss: 450,
            notes: 'NBA Finals Game 1'
          },
          {
            description: 'Manchester United vs Liverpool - Over 2.5 goals',
            amount: 300,
            outcome: 'lost',
            profitLoss: -300,
            notes: 'Premier League'
          },
          {
            description: 'Golden State Warriors -5.5',
            amount: 750,
            outcome: 'won',
            profitLoss: 675,
            notes: 'Regular season game'
          },
          {
            description: 'UFC 295 - Main event',
            amount: 1000,
            outcome: 'pending',
            profitLoss: 0,
            notes: 'Championship fight'
          }
        ]
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Setup complete!',
      admin: {
        email: admin.email,
        name: admin.name
      },
      credentials: {
        email: 'admin@basiliskfund.com',
        password: 'admin123'
      },
      note: 'Please change the password after first login'
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to complete setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}