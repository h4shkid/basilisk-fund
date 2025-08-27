'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Trophy, TrendingUp, User } from 'lucide-react'

interface Member {
  id: string
  name: string
  totalInvested: number
  totalEarnings: number
  totalPayouts: number
  investmentPercentage: number
  currentBalance: number
}

export function Leaderboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [activeTab, setActiveTab] = useState<'investors' | 'earners'>('investors')

  useEffect(() {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data.members)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    if (activeTab === 'investors') {
      return b.totalInvested - a.totalInvested
    }
    return b.totalEarnings - a.totalEarnings
  })

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return null
  }

  return (
    <div className="glassmorphism p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('investors')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'investors'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Top Investors
          </button>
          <button
            onClick={() => setActiveTab('earners')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'earners'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Top Earners
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedMembers.slice(0, 10).map((member, index) => {
          const position = index + 1
          const icon = getPositionIcon(position)
          
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  {icon ? (
                    <span className="text-2xl">{icon}</span>
                  ) : (
                    <span className="text-gray-400 font-semibold">#{position}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  
                  <div>
                    <p className="text-white font-semibold">{member.name}</p>
                    <p className="text-gray-400 text-sm">
                      {formatPercentage(member.investmentPercentage)} of fund
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-bold text-lg">
                  {formatCurrency(
                    activeTab === 'investors' ? member.totalInvested : member.totalEarnings
                  )}
                </p>
                <p className="text-gray-400 text-sm">
                  Balance: {formatCurrency(member.currentBalance)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}