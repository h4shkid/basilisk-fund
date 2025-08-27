'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Shield, 
  Users, 
  TrendingUp, 
  DollarSign,
  Image as ImageIcon,
  LogOut,
  Home,
  LayoutDashboard
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/dashboard/members', icon: Users },
  { name: 'Bets', href: '/admin/dashboard/bets', icon: TrendingUp },
  { name: 'Investments', href: '/admin/dashboard/investments', icon: DollarSign },
  { name: 'Payouts', href: '/admin/dashboard/payouts', icon: DollarSign },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 glassmorphism border-r border-white/10">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="gradient-border">
              <div className="p-2">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">
              Basilisk Fund
            </h1>
          </Link>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}