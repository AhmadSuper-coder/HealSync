import { signIn } from "next-auth/react";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Footer from "@/components/landing/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">HealSync</span>
                </div>
                
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Features</a>
                  <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">How it Works</a>
                  <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Pricing</a>
                  <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Testimonials</a>
                </div>
                
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <button 
                    onClick={() => signIn("google")}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors" 
                    data-testid="button-login"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <HeroSection />
            <div id="features">
              <FeaturesSection />
            </div>
            <div id="how-it-works">
              <HowItWorksSection />
            </div>
            <div id="pricing">
              <PricingSection />
            </div>
            <div id="testimonials">
              <TestimonialsSection />
            </div>
          </main>

          <Footer />
        </div>
      </ThemeProvider>
  );
}