'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, Clock, Upload, Trash2, Edit2 } from 'lucide-react'

interface Bet {
  id: string
  description: string
  amount: number
  outcome: string
  profitLoss: number
  datePlaced: string
  imageUrl?: string
  notes?: string
}

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    outcome: 'pending',
    profitLoss: 0,
    notes: ''
  })

  useEffect(() => {
    fetchBets()
  }, [])

  const fetchBets = async () => {
    try {
      const res = await fetch('/api/bets')
      const data = await res.json()
      setBets(data.bets)
    } catch (error) {
      console.error('Failed to fetch bets:', error)
    }
  }

  const handleAddBet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowAddModal(false)
        setFormData({
          description: '',
          amount: 0,
          outcome: 'pending',
          profitLoss: 0,
          notes: ''
        })
        fetchBets()
      }
    } catch (error) {
      console.error('Failed to add bet:', error)
    }
  }

  const handleDeleteBet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bet?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/bets/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchBets()
      } else {
        alert('Failed to delete bet')
      }
    } catch (error) {
      console.error('Failed to delete bet:', error)
      alert('Failed to delete bet')
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
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    const colors = {
      won: 'bg-green-500/20 text-green-500',
      lost: 'bg-red-500/20 text-red-500',
      pending: 'bg-yellow-500/20 text-yellow-500'
    }
    
    return colors[outcome as keyof typeof colors] || colors.pending
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bets</h1>
          <p className="text-gray-400">Track and manage all betting activities</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Bet
        </button>
      </div>

      <div className="glassmorphism overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 font-medium">Description</th>
              <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
              <th className="text-left p-4 text-gray-400 font-medium">Outcome</th>
              <th className="text-left p-4 text-gray-400 font-medium">Profit/Loss</th>
              <th className="text-left p-4 text-gray-400 font-medium">Notes</th>
              <th className="text-left p-4 text-gray-400 font-medium">Image</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400">
                  {new Date(bet.datePlaced).toLocaleDateString()}
                </td>
                <td className="p-4 text-white">{bet.description}</td>
                <td className="p-4 text-white">{formatCurrency(bet.amount)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${getOutcomeBadge(bet.outcome)}`}>
                    {getOutcomeIcon(bet.outcome)}
                    {bet.outcome.toUpperCase()}
                  </span>
                </td>
                <td className={`p-4 font-semibold ${getOutcomeColor(bet.outcome)}`}>
                  {bet.outcome === 'won' ? '+' : bet.outcome === 'lost' ? '-' : ''}
                  {formatCurrency(Math.abs(bet.profitLoss))}
                </td>
                <td className="p-4 text-gray-400 text-sm max-w-xs truncate">
                  {bet.notes || '-'}
                </td>
                <td className="p-4">
                  {bet.imageUrl ? (
                    <span className="text-green-500 text-sm">Has image</span>
                  ) : (
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert('Edit functionality coming soon!')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBet(bet.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Bet</h2>
            
            <form onSubmit={handleAddBet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter bet description"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Outcome
                </label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              {(formData.outcome === 'won' || formData.outcome === 'lost') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profit/Loss Amount
                  </label>
                  <input
                    type="number"
                    value={formData.profitLoss}
                    onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Add any additional notes"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}