import { FundStats } from '@/components/FundStats'
import { Leaderboard } from '@/components/Leaderboard'
import { BetShowcase } from '@/components/BetShowcase'
import Link from 'next/link'
import { Shield, Activity } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glassmorphism border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="gradient-border">
                <div className="p-2">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Basilisk Fund
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-500">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Live</span>
              </div>
              
              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                Admin
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Collaborative Betting
            </span>
            <br />
            <span className="text-3xl md:text-4xl">Amplified Returns</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pool your investments, share the winnings. Track your performance in real-time.
          </p>
        </div>

        <FundStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Leaderboard />
          <BetShowcase />
        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Basilisk Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
