'use client'

import { useSession, signOut } from 'next-auth/react'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">HealSync</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {session?.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || ''} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">{session?.user?.name}</span>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}