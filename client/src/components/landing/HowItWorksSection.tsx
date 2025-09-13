import { ArrowRight, LogIn, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "1. Quick Login",
    description: "Sign up instantly with your Google account. No complex setup required - start managing patients in minutes.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Users,
    title: "2. Manage Patients",
    description: "Add patient records, schedule appointments, track treatments, and maintain comprehensive medical histories.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: TrendingUp,
    title: "3. Grow Your Practice",
    description: "Use analytics insights, automated communications, and revenue tracking to expand and optimize your practice.",
    color: "from-purple-500 to-purple-600"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Get Started in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Three Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform your healthcare practice with HealSync's intuitive platform. 
            From setup to growth, we've streamlined every step of your journey.
          </p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transform -translate-y-1/2 mx-20"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg mb-6`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  {/* Arrow for non-last items */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-full border shadow-sm">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-3xl text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of doctors who are already using HealSync to provide better patient care and grow their practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors duration-300" data-testid="button-start-free-trial">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300" data-testid="button-schedule-demo">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}