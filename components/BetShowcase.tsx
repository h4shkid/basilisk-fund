'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'

interface Bet {
  id: string
  description: string
  amount: number
  outcome: string
  profitLoss: number
  datePlaced: string
  imageUrl?: string
}

export function BetShowcase() {
  const [bets, setBets] = useState<Bet[]>([])
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null)

  useEffect(() => {
    fetchBets()
  }, [])

  const fetchBets = async () => {
    try {
      const res = await fetch('/api/bets')
      const data = await res.json()
      setBets(data.bets.filter((bet: Bet) => bet.imageUrl))
    } catch (error) {
      console.error('Failed to fetch bets:', error)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'text-green-500'
      case 'lost': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'won': return <TrendingUp className="w-4 h-4" />
      case 'lost': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="glassmorphism p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Recent Bets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bets.slice(0, 6).map((bet) => (
          <div
            key={bet.id}
            className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedBet(bet)}
          >
            {bet.imageUrl && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80">
                <Image
                  src={bet.imageUrl}
                  alt={bet.description}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="font-semibold mb-2 line-clamp-2">{bet.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-300">
                    {new Date(bet.datePlaced).toLocaleDateString()}
                  </span>
                </div>
                
                <div className={`flex items-center gap-1 ${getOutcomeColor(bet.outcome)}`}>
                  {getOutcomeIcon(bet.outcome)}
                  <span className="text-sm font-bold">
                    {bet.outcome === 'won' ? '+' : bet.outcome === 'lost' ? '-' : ''}
                    {formatCurrency(Math.abs(bet.profitLoss))}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
      
      {bets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No bets with images yet</p>
        </div>
      )}
    </div>
  )
}