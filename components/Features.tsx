export default function Features() {
  const features = [
    {
      icon: '👤',
      title: 'Patient Management',
      description: 'Complete patient records, medical history, and appointment tracking in one secure platform.'
    },
    {
      icon: '📅',
      title: 'Smart Appointments',
      description: 'Automated scheduling, reminders, and calendar integration to reduce no-shows.'
    },
    {
      icon: '💰',
      title: 'Revenue Tracking',
      description: 'Monitor income, track payments, and generate financial reports with ease.'
    },
    {
      icon: '📄',
      title: 'Document Storage',
      description: 'Secure cloud storage for prescriptions, test results, and medical documents.'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Insights into patient trends, appointment patterns, and practice growth metrics.'
    },
    {
      icon: '💬',
      title: 'Communication Tools',
      description: 'WhatsApp, SMS, and email integration for follow-ups, festival greetings, and prescription delivery.'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Run Your Practice
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            HealSync brings together all the tools modern healthcare providers need in one intuitive platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Advanced Communication Suite</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">WhatsApp Integration</h4>
              <p className="text-sm opacity-90">Send appointment reminders and prescriptions directly</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Festival Greetings</h4>
              <p className="text-sm opacity-90">Automated holiday wishes to strengthen patient relationships</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Bill & Prescription Delivery</h4>
              <p className="text-sm opacity-90">Digital delivery of bills and prescriptions via multiple channels</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}