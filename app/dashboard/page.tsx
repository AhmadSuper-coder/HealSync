import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">124</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
          <p className="text-3xl font-bold text-secondary-600 mt-2">18</p>
          <p className="text-sm text-gray-500 mt-1">6 pending confirmations</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">₹45,600</p>
          <p className="text-sm text-gray-500 mt-1">+8% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Pending Follow-ups</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">7</p>
          <p className="text-sm text-gray-500 mt-1">Due this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-500">Last visit: Today</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Sarah Wilson</p>
                <p className="text-sm text-gray-500">Next appointment: Tomorrow</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Scheduled</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-500 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <p className="text-sm font-medium">Add Patient</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-500 transition-colors">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm font-medium">Schedule Appointment</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-500 transition-colors">
              <div className="text-2xl mb-2">💊</div>
              <p className="text-sm font-medium">Create Prescription</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-500 transition-colors">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm font-medium">Send Message</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}