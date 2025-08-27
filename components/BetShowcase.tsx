'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Calendar, TrendingUp, TrendingDown, X } from 'lucide-react'

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

  useEffect(function() {
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
            className="relative rounded-xl overflow-hidden cursor-pointer group bg-white/5 hover:bg-white/10 transition-all"
            onClick={() => setSelectedBet(bet)}
          >
            {bet.imageUrl && (
              <div className="relative">
                <img
                  src={bet.imageUrl}
                  alt={bet.description}
                  className="w-full h-auto object-contain bg-black/20"
                  style={{ maxHeight: '500px' }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                  <p className="font-semibold text-white mb-2 line-clamp-2">{bet.description}</p>
                  
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
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
      
      {bets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No bets with images yet</p>
        </div>
      )}

      {/* Modal for viewing full image */}
      {selectedBet && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBet(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedBet(null)
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <img
              src={selectedBet.imageUrl}
              alt={selectedBet.description}
              className="w-full h-auto"
            />
            
            <div className="bg-black/80 p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{selectedBet.description}</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">
                    Amount: {formatCurrency(selectedBet.amount)}
                  </span>
                  <span className="text-gray-300">
                    Date: {new Date(selectedBet.datePlaced).toLocaleDateString()}
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 text-lg font-bold ${getOutcomeColor(selectedBet.outcome)}`}>
                  {getOutcomeIcon(selectedBet.outcome)}
                  <span>
                    {selectedBet.outcome === 'won' ? '+' : selectedBet.outcome === 'lost' ? '-' : ''}
                    {formatCurrency(Math.abs(selectedBet.profitLoss))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}