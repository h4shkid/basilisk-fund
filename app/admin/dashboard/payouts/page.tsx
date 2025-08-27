'use client'

import { formatCurrency } from '@/lib/utils'
import { Plus, DollarSign } from 'lucide-react'

export default function PayoutsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payouts</h1>
          <p className="text-gray-400">Process member withdrawals</p>
        </div>
        
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          Process Payout
        </button>
      </div>

      <div className="glassmorphism p-8">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Payout processing coming soon</p>
        </div>
      </div>
    </div>
  )
}