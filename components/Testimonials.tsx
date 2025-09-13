export default function Testimonials() {
  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      title: 'General Physician',
      location: 'Mumbai',
      quote: 'HealSync has transformed my practice. The WhatsApp integration for appointment reminders has reduced no-shows by 70%. My patients love receiving their prescriptions digitally.',
      rating: 5
    },
    {
      name: 'Dr. Rajesh Kumar',
      title: 'Pediatrician', 
      location: 'Delhi',
      quote: 'The revenue tracking feature is incredible. I can see exactly how my practice is growing month over month. The festival greeting automation has really strengthened my patient relationships.',
      rating: 5
    },
    {
      name: 'Dr. Anjali Patel',
      title: 'Dermatologist',
      location: 'Bangalore',
      quote: 'As a solo practitioner, HealSync gives me enterprise-level capabilities. The document storage and patient record management save me hours every week.',
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Healthcare Providers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what doctors are saying about HealSync
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-600 mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t pt-6">
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-primary-600">{testimonial.title}</div>
                <div className="text-gray-500 text-sm">{testimonial.location}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">500+</div>
              <div className="text-sm">Active Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">50,000+</div>
              <div className="text-sm">Patients Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">99.9%</div>
              <div className="text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}