import { 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Heart,
  Smartphone,
  Mail,
  Gift
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Complete patient records, medical history, and treatment tracking in one secure platform.",
    color: "text-blue-600"
  },
  {
    icon: Calendar,
    title: "Smart Appointments",
    description: "Automated scheduling, reminders, and calendar integration to optimize your practice workflow.",
    color: "text-green-600"
  },
  {
    icon: TrendingUp,
    title: "Revenue Tracking",
    description: "Real-time financial insights, payment tracking, and comprehensive revenue analytics.",
    color: "text-purple-600"
  },
  {
    icon: FileText,
    title: "Document Storage",
    description: "Secure cloud storage for prescriptions, lab reports, and medical documents with easy access.",
    color: "text-orange-600"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed insights into patient trends, practice performance, and growth opportunities.",
    color: "text-red-600"
  },
  {
    icon: MessageCircle,
    title: "Communication Hub",
    description: "Integrated messaging platform connecting all your communication tools in one place.",
    color: "text-indigo-600"
  }
];

const communicationFeatures = [
  {
    icon: Smartphone,
    title: "WhatsApp Integration",
    description: "Send appointment reminders, lab results, and follow-ups directly via WhatsApp."
  },
  {
    icon: MessageCircle,
    title: "SMS Notifications",
    description: "Automated SMS alerts for appointments, medication reminders, and health tips."
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description: "Professional email templates for newsletters, health education, and practice updates."
  },
  {
    icon: Gift,
    title: "Festival Greetings",
    description: "Automated festival and birthday wishes to strengthen patient relationships."
  },
  {
    icon: FileText,
    title: "Bill & Prescription Delivery",
    description: "Digital delivery of bills, prescriptions, and reports directly to patients."
  },
  {
    icon: Heart,
    title: "Follow-up Care",
    description: "Automated follow-up sequences for post-treatment care and medication adherence."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Grow Your Practice
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            HealSync provides comprehensive tools to streamline your healthcare practice, 
            improve patient care, and boost your revenue with smart automation.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Communication Tools Section */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-12 rounded-3xl border">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Communication Tools
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Keep your patients engaged and informed with our comprehensive communication suite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communicationFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}