import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin account
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@basiliskfund.com' },
    update: {},
    create: {
      email: 'admin@basiliskfund.com',
      password: hashedPassword,
      name: 'Admin User'
    }
  })

  console.log('Admin account created:', admin.email)
  console.log('Default password: admin123')
  console.log('Please change the password after first login')

  // Create sample members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        totalInvested: 5000,
        totalEarnings: 1250,
        totalPayouts: 500,
        isActive: true,
        investments: {
          create: [
            { amount: 3000, notes: 'Initial investment' },
            { amount: 2000, notes: 'Additional investment' }
          ]
        }
      }
    }),
    prisma.member.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        totalInvested: 10000,
        totalEarnings: 2500,
        totalPayouts: 1000,
        isActive: true,
        investments: {
          create: [
            { amount: 10000, notes: 'Initial investment' }
          ]
        }
      }
    }),
    prisma.member.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        totalInvested: 7500,
        totalEarnings: 1875,
        totalPayouts: 0,
        isActive: true,
        investments: {
          create: [
            { amount: 5000, notes: 'Initial investment' },
            { amount: 2500, notes: 'Q2 investment' }
          ]
        }
      }
    })
  ])

  console.log(`Created ${members.length} sample members`)

  // Create sample bets
  const bets = await Promise.all([
    prisma.bet.create({
      data: {
        description: 'Lakers vs Celtics - Lakers to win',
        amount: 500,
        outcome: 'won',
        profitLoss: 450,
        notes: 'NBA Finals Game 1'
      }
    }),
    prisma.bet.create({
      data: {
        description: 'Manchester United vs Liverpool - Over 2.5 goals',
        amount: 300,
        outcome: 'lost',
        profitLoss: -300,
        notes: 'Premier League'
      }
    }),
    prisma.bet.create({
      data: {
        description: 'Golden State Warriors -5.5',
        amount: 750,
        outcome: 'won',
        profitLoss: 675,
        notes: 'Regular season game'
      }
    }),
    prisma.bet.create({
      data: {
        description: 'UFC 295 - Main event',
        amount: 1000,
        outcome: 'pending',
        profitLoss: 0,
        notes: 'Championship fight'
      }
    })
  ])

  console.log(`Created ${bets.length} sample bets`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })