'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, DollarSign, Calendar, User } from 'lucide-react'

interface Investment {
  id: string
  amount: number
  date: string
  notes: string | null
  member: {
    id: string
    name: string
  }
}

interface Member {
  id: string
  name: string
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 0,
    notes: ''
  })

  useEffect(() => {
    fetchInvestments()
    fetchMembers()
  }, [])

  const fetchInvestments = async () => {
    try {
      const res = await fetch('/api/investments')
      const data = await res.json()
      setInvestments(data)
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data.members)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ memberId: '', amount: 0, notes: '' })
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to add investment:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investments</h1>
          <p className="text-gray-400">Track all member investments</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Record Investment
        </button>
      </div>

      <div className="glassmorphism overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 font-medium">Member</th>
              <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
              <th className="text-left p-4 text-gray-400 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => (
              <tr key={investment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(investment.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">{investment.member.name}</span>
                  </div>
                </td>
                <td className="p-4 text-white font-semibold">{formatCurrency(investment.amount)}</td>
                <td className="p-4 text-gray-400">{investment.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {investments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No investments recorded yet</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Record Investment</h2>
            
            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member
                </label>
                <select
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
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
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Add any notes about this investment"
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
                  Record Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}