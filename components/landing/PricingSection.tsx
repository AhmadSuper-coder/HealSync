import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for individual practitioners starting their digital journey",
    features: [
      "Up to 50 patients",
      "Basic appointment scheduling",
      "Patient records management",
      "Email notifications",
      "Basic analytics",
      "Mobile app access",
      "24/7 email support"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "per month",
    description: "Complete solution for growing practices and multi-doctor clinics",
    features: [
      "Unlimited patients",
      "Advanced scheduling & calendar sync",
      "Complete patient history",
      "WhatsApp, SMS & Email integration",
      "Revenue tracking & analytics",
      "Document storage (10GB)",
      "Festival greetings automation",
      "Bill & prescription delivery",
      "Patient communication campaigns",
      "Advanced reporting",
      "Multi-user access",
      "Priority phone support",
      "Custom branding"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true
  }
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Pricing for Everyone
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no long-term contracts. 
            Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 p-8 lg:p-12 transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 shadow-xl scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xl text-gray-500 dark:text-gray-400 ml-2">
                    {plan.period}
                  </span>
                </div>
                {plan.name === "Pro" && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    14-day free trial included
                  </p>
                )}
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  What's included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.buttonVariant}
                size="lg"
                className={`w-full text-lg py-6 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : ''
                }`}
                data-testid={`button-${plan.name.toLowerCase()}-plan`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Large hospitals and healthcare networks can contact us for enterprise pricing 
              and custom integrations tailored to your specific needs.
            </p>
            <Button variant="outline" size="lg" className="rounded-full" data-testid="button-contact-enterprise">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}