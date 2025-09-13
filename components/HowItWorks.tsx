export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Quick Login',
      description: 'Sign in with your Google account in seconds. No complex setup required.',
      icon: '🔐'
    },
    {
      step: '02', 
      title: 'Manage Patients',
      description: 'Add patients, schedule appointments, and maintain comprehensive medical records.',
      icon: '👥'
    },
    {
      step: '03',
      title: 'Grow Your Practice',
      description: 'Use analytics, automated communications, and revenue tracking to expand your practice.',
      icon: '📈'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How HealSync Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes and transform your practice management
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-primary-200 transform translate-x-4 z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-primary-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    {step.icon}
                  </div>
                  
                  <div className="bg-primary-100 text-primary-700 font-bold text-sm px-3 py-1 rounded-full inline-block mb-4">
                    STEP {step.step}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}