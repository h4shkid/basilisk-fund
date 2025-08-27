'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, DollarSign, Calendar, User, ArrowUpRight } from 'lucide-react'

interface Payout {
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
  currentBalance?: number
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 0,
    notes: ''
  })

  useEffect(() => {
    fetchPayouts()
    fetchMembers()
  }, [])

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/payouts')
      const data = await res.json()
      setPayouts(data)
    } catch (error) {
      console.error('Failed to fetch payouts:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      const membersWithBalance = data.members.map((m: Member & { totalInvested: number; totalEarnings: number; totalPayouts: number }) => ({
        ...m,
        currentBalance: m.totalInvested + m.totalEarnings - m.totalPayouts
      }))
      setMembers(membersWithBalance)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedMember = members.find(m => m.id === formData.memberId)
    if (selectedMember && selectedMember.currentBalance && formData.amount > selectedMember.currentBalance) {
      alert(`Payout amount exceeds member's balance of ${formatCurrency(selectedMember.currentBalance)}`)
      return
    }
    
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ memberId: '', amount: 0, notes: '' })
        fetchPayouts()
        fetchMembers()
      }
    } catch (error) {
      console.error('Failed to process payout:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payouts</h1>
          <p className="text-gray-400">Process member withdrawals</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Process Payout
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
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(payout.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">{payout.member.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-red-500 font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    {formatCurrency(payout.amount)}
                  </div>
                </td>
                <td className="p-4 text-gray-400">{payout.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {payouts.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payouts processed yet</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Process Payout</h2>
            
            <form onSubmit={handleProcessPayout} className="space-y-4">
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
                      {member.name} - Balance: {formatCurrency(member.currentBalance || 0)}
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
                {formData.memberId && (
                  <p className="text-sm text-gray-400 mt-2">
                    Available balance: {formatCurrency(members.find(m => m.id === formData.memberId)?.currentBalance || 0)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Add any notes about this payout"
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
                  Process Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}