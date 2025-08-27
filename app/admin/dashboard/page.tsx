'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Trophy,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalFundSize: number
  totalEarnings: number
  totalPayouts: number
  activeMembersCount: number
  totalBets: number
  winRate: number
  pendingBets: number
  recentActivity: Array<{ description: string; time: string }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFundSize: 0,
    totalEarnings: 0,
    totalPayouts: 0,
    activeMembersCount: 0,
    totalBets: 0,
    winRate: 0,
    pendingBets: 0,
    recentActivity: []
  })
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalculateMessage, setRecalculateMessage] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
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
        totalPayouts: membersData.members.reduce((acc: number, m: { totalPayouts: number }) => acc + m.totalPayouts, 0),
        activeMembersCount: membersData.stats.activeMembersCount,
        totalBets: betsData.stats.totalBets,
        winRate: betsData.stats.winRate,
        pendingBets: betsData.stats.pendingBets,
        recentActivity: []
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handleRecalculateEarnings = async () => {
    setIsRecalculating(true)
    setRecalculateMessage('')
    
    try {
      const response = await fetch('/api/admin/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setRecalculateMessage(`Successfully recalculated earnings. Total profits: ${formatCurrency(data.totalProfits)}`)
        await fetchDashboardData()
      } else {
        setRecalculateMessage('Failed to recalculate earnings')
      }
    } catch (error) {
      setRecalculateMessage('Error recalculating earnings')
    } finally {
      setIsRecalculating(false)
      setTimeout(() => setRecalculateMessage(''), 5000)
    }
  }

  const statCards = [
    {
      title: 'Total Fund Size',
      value: formatCurrency(stats.totalFundSize),
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      trend: 'up'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      change: '+8.3%',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    {
      title: 'Active Members',
      value: stats.activeMembersCount.toString(),
      change: '+2',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      trend: 'up'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      change: '+2.1%',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      trend: 'up'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, Admin</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleRecalculateEarnings}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate Earnings'}
            </button>
            
            {recalculateMessage && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                recalculateMessage.includes('Successfully') 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <AlertCircle className="w-4 h-4" />
                {recalculateMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="glassmorphism p-6 relative overflow-hidden group">
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-2.5`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glassmorphism p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Quick Stats
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Total Bets Placed</span>
              <span className="text-white font-semibold">{stats.totalBets}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Pending Bets</span>
              <span className="text-yellow-500 font-semibold">{stats.pendingBets}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Total Payouts</span>
              <span className="text-white font-semibold">{formatCurrency(stats.totalPayouts)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400">Net Profit</span>
              <span className="text-green-500 font-semibold">
                {formatCurrency(stats.totalEarnings - stats.totalPayouts)}
              </span>
            </div>
          </div>
        </div>

        <div className="glassmorphism p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">{activity.description}</span>
                  <span className="text-white text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}