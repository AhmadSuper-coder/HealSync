import { Stethoscope, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "API Documentation", href: "/docs" },
    { name: "Integrations", href: "/integrations" }
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Support", href: "/support" },
    { name: "System Status", href: "/status" },
    { name: "Training Videos", href: "/training" },
    { name: "Community Forum", href: "/community" }
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press Kit", href: "/press" },
    { name: "Partner Program", href: "/partners" },
    { name: "Blog", href: "/blog" }
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "HIPAA Compliance", href: "/hipaa" },
    { name: "Data Security", href: "/security" },
    { name: "Cookie Policy", href: "/cookies" }
  ]
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/healsync" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/healsync" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/healsync" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/healsync" }
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Healthcare Practice?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of doctors who trust HealSync for their patient management needs. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-white text-gray-900 border-0 rounded-full px-6 py-3"
              data-testid="input-email-signup"
            />
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-3 font-semibold"
              data-testid="button-get-started-footer"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">HealSync</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                The modern patient management platform that helps healthcare professionals 
                provide better care, streamline operations, and grow their practice.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3 text-blue-400" />
                  <span>support@healsync.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3 text-blue-400" />
                  <span>+91 80000 12345</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                  <span>Bangalore, India</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              © 2024 HealSync. All rights reserved. Built with ❤️ for healthcare professionals.
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-social-${social.name.toLowerCase()}`}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}