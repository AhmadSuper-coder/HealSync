export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for small practices getting started',
      features: [
        'Up to 50 patients',
        'Basic appointment scheduling',
        'Simple patient records',
        'Email support',
        'Basic analytics'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
    },
    {
      name: 'Pro',
      price: '₹999',
      period: 'per month',
      description: 'For growing practices that need advanced features',
      features: [
        'Unlimited patients',
        'Advanced scheduling & reminders',
        'Complete medical records',
        'WhatsApp & SMS integration',
        'Revenue tracking & reports',
        'Document storage (10GB)',
        'Festival greeting automation',
        'Priority support',
        'Custom branding'
      ],
      buttonText: 'Start Pro Trial',
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700',
      popular: true
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your practice. Upgrade or downgrade anytime.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white p-8 rounded-2xl shadow-lg border-2 ${plan.popular ? 'border-primary-500' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>✓ 99.9% uptime guarantee</span>
            <span>✓ Bank-level security</span>
            <span>✓ HIPAA compliant</span>
            <span>✓ 24/7 data backup</span>
          </div>
        </div>
      </div>
    </section>
  )
}