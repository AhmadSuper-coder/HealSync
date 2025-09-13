import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    specialty: "General Physician",
    location: "Mumbai",
    rating: 5,
    text: "HealSync transformed my practice completely. The WhatsApp integration alone saved me 3 hours daily, and my patients love receiving automated reminders and festival greetings. Revenue tracking helped me increase my monthly income by 40%.",
    avatar: "PS"
  },
  {
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist", 
    location: "Delhi",
    rating: 5,
    text: "Managing 200+ patients was overwhelming until I found HealSync. The analytics showed me peak appointment hours, helping me optimize my schedule. The prescription delivery feature is a game-changer for my elderly patients.",
    avatar: "RK"
  },
  {
    name: "Dr. Anita Patel",
    specialty: "Pediatrician",
    location: "Ahmedabad", 
    rating: 5,
    text: "The communication tools are incredible! Sending vaccination reminders via SMS and WhatsApp has improved my immunization rates by 60%. Parents appreciate the automated follow-ups after their child's visit.",
    avatar: "AP"
  },
  {
    name: "Dr. Suresh Reddy",
    specialty: "Orthopedic Surgeon",
    location: "Hyderabad",
    rating: 5,
    text: "HealSync's document storage is fantastic. I can access patient X-rays and reports instantly during consultations. The revenue insights helped me identify my most profitable services and focus my practice accordingly.",
    avatar: "SR"
  },
  {
    name: "Dr. Meera Nair",
    specialty: "Gynecologist",
    location: "Kochi",
    rating: 5,
    text: "The appointment scheduling is seamless. Patients can book online, and I never have to worry about double bookings. The festival greeting feature helps me maintain personal connections with my patients.",
    avatar: "MN"
  },
  {
    name: "Dr. Arvind Shah",
    specialty: "Dermatologist",
    location: "Pune",
    rating: 5,
    text: "From patient management to billing, everything is in one place. The multi-user access feature allows my staff to help with scheduling while maintaining patient privacy. Highly recommend for any practice.",
    avatar: "AS"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by Healthcare
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Professionals Nationwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how doctors across India are transforming their practices and improving 
            patient care with HealSync's comprehensive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="bg-blue-600 p-3 rounded-full shadow-lg">
                  <Quote className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4 pt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Doctor Info */}
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {testimonial.specialty}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Doctors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">500K+</div>
                <div className="text-gray-600 dark:text-gray-300">Patients Managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
                <div className="text-gray-600 dark:text-gray-300">User Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}