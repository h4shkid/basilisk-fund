'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, Clock, Upload, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react'

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBet, setEditingBet] = useState<Bet | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    outcome: 'pending',
    profitLoss: 0,
    notes: '',
    imageUrl: ''
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      // For now, we'll convert to base64 and store as data URL
      // In production, you'd upload to a proper storage service
      return imagePreview
    } catch (error) {
      console.error('Failed to upload image:', error)
      return null
    }
  }

  const handleAddBet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const imageUrl = await uploadImage()
      
      // Ensure losses are negative
      let profitLoss = formData.profitLoss
      if (formData.outcome === 'lost' && profitLoss > 0) {
        profitLoss = -profitLoss
      }
      
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profitLoss,
          imageUrl: imageUrl || undefined
        })
      })
      
      if (res.ok) {
        setShowAddModal(false)
        resetForm()
        fetchBets()
      }
    } catch (error) {
      console.error('Failed to add bet:', error)
    }
  }

  const handleEditBet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBet) return

    try {
      let imageUrl = formData.imageUrl
      
      // Upload new image if one was selected
      if (imageFile) {
        const newImageUrl = await uploadImage()
        if (newImageUrl) imageUrl = newImageUrl
      }
      
      // Ensure losses are negative
      let profitLoss = formData.profitLoss
      if (formData.outcome === 'lost' && profitLoss > 0) {
        profitLoss = -profitLoss
      }
      
      const res = await fetch(`/api/bets/${editingBet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profitLoss,
          imageUrl
        })
      })
      
      if (res.ok) {
        setShowEditModal(false)
        setEditingBet(null)
        resetForm()
        fetchBets()
      }
    } catch (error) {
      console.error('Failed to update bet:', error)
    }
  }

  const handleDeleteBet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bet? This will also adjust member earnings if applicable.')) {
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

  const openEditModal = (bet: Bet) => {
    setEditingBet(bet)
    setFormData({
      description: bet.description,
      amount: bet.amount,
      outcome: bet.outcome,
      profitLoss: bet.profitLoss,
      notes: bet.notes || '',
      imageUrl: bet.imageUrl || ''
    })
    setImagePreview(bet.imageUrl || '')
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      outcome: 'pending',
      profitLoss: 0,
      notes: '',
      imageUrl: ''
    })
    setImageFile(null)
    setImagePreview('')
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
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
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
                    <button 
                      onClick={() => window.open(bet.imageUrl, '_blank')}
                      className="text-green-500 text-sm hover:text-green-400 flex items-center gap-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(bet)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Bet</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
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
                    {formData.outcome === 'won' ? 'Profit Amount' : 'Loss Amount'} (enter positive value)
                  </label>
                  <input
                    type="number"
                    value={Math.abs(formData.profitLoss)}
                    onChange={(e) => setFormData({ ...formData, profitLoss: Math.abs(parseFloat(e.target.value)) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.outcome === 'won' 
                      ? 'Amount won (will be distributed to members)' 
                      : 'Amount lost (will be deducted from members)'}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </label>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
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
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
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

      {/* Edit Modal */}
      {showEditModal && editingBet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Bet</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingBet(null)
                  resetForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleEditBet} className="space-y-4">
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
                    {formData.outcome === 'won' ? 'Profit Amount' : 'Loss Amount'} (enter positive value)
                  </label>
                  <input
                    type="number"
                    value={Math.abs(formData.profitLoss)}
                    onChange={(e) => setFormData({ ...formData, profitLoss: Math.abs(parseFloat(e.target.value)) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.outcome === 'won' 
                      ? 'Amount won (will be distributed to members)' 
                      : 'Amount lost (will be deducted from members)'}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Update Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                          setFormData({ ...formData, imageUrl: '' })
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
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
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBet(null)
                    resetForm()
                  }}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Update Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}