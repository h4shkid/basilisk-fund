'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Plus, Edit2, Trash2, User, DollarSign } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string | null
  totalInvested: number
  totalEarnings: number
  totalPayouts: number
  isActive: boolean
  investmentPercentage: number
  currentBalance: number
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    initialInvestment: 0
  })

  useEffect(() => {
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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ name: '', email: '', initialInvestment: 0 })
        fetchMembers()
      }
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member? This will also delete all their investments and payouts.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchMembers()
      } else {
        alert('Failed to delete member')
      }
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Members</h1>
          <p className="text-gray-400">Manage fund members and their investments</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="glassmorphism overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Member</th>
              <th className="text-left p-4 text-gray-400 font-medium">Investment</th>
              <th className="text-left p-4 text-gray-400 font-medium">Earnings</th>
              <th className="text-left p-4 text-gray-400 font-medium">Payouts</th>
              <th className="text-left p-4 text-gray-400 font-medium">Balance</th>
              <th className="text-left p-4 text-gray-400 font-medium">Fund %</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      {member.email && (
                        <p className="text-gray-400 text-sm">{member.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white">{formatCurrency(member.totalInvested)}</td>
                <td className="p-4 text-green-500">{formatCurrency(member.totalEarnings)}</td>
                <td className="p-4 text-white">{formatCurrency(member.totalPayouts)}</td>
                <td className="p-4 text-white font-semibold">{formatCurrency(member.currentBalance)}</td>
                <td className="p-4 text-white">{formatPercentage(member.investmentPercentage)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.isActive
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
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
                      onClick={() => handleDeleteMember(member.id)}
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
          <div className="glassmorphism p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Member</h2>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter member name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Investment
                </label>
                <input
                  type="number"
                  value={formData.initialInvestment}
                  onChange={(e) => setFormData({ ...formData, initialInvestment: parseFloat(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}