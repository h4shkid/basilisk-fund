'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, DollarSign, Trophy } from 'lucide-react'

interface FundStats {
  totalFundSize: number
  totalEarnings: number
  activeMembersCount: number
  winRate: number
}

export function FundStats() {
  const [stats, setStats] = useState<FundStats>({
    totalFundSize: 0,
    totalEarnings: 0,
    activeMembersCount: 0,
    winRate: 0
  })

  useEffect(function() {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [membersRes, betsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/bets')
      ])
      
      const membersData = await membersRes.json()
      const betsData = await betsRes.json()
      
      setStats({
        totalFundSize: membersData.stats.totalFundSize,
        totalEarnings: membersData.stats.totalEarnings,
        activeMembersCount: membersData.stats.activeMembersCount,
        winRate: betsData.stats.winRate
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Fund Size',
      value: formatCurrency(stats.totalFundSize),
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Members',
      value: stats.activeMembersCount.toString(),
      icon: Users,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Win Rate',
      value: stats.winRate !== null && stats.winRate !== undefined && !isNaN(stats.winRate) 
        ? `${stats.winRate.toFixed(1)}%` 
        : '0.0%',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="glassmorphism p-6 relative overflow-hidden group">
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-2.5 mb-4`}>
                <Icon className="w-full h-full text-white" />
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}