import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Stethoscope, Users, TrendingUp, Mail, Lock } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("email-password", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-gray-900 dark:to-green-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HealSync</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          Modern Patient Management
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
            For Healthcare Heroes
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Streamline your practice with HealSync's comprehensive multi-tenant platform. 
          Manage patients, track revenue, schedule appointments, and communicate seamlessly 
          with integrated WhatsApp, SMS, and email tools.
        </p>

        {/* Login Section */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to HealSync</CardTitle>
              <CardDescription>Choose your login method to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="google" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google" data-testid="tab-google">Google</TabsTrigger>
                  <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
                </TabsList>
                
                <TabsContent value="google" className="space-y-4">
                  <Button
                    onClick={() => signIn("google")}
                    disabled={status === "loading"}
                    className="w-full"
                    size="lg"
                    data-testid="button-login-google"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {status === "loading" ? "Loading..." : "Continue with Google"}
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Sign in securely with your Google account
                  </div>
                </TabsContent>
                
                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          data-testid="input-password"
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm text-center" data-testid="error-message">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading || !email || !password}
                      data-testid="button-login-email"
                    >
                      {isLoading ? "Signing in..." : "Sign in with Email"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 rounded-full border-2 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              data-testid="button-learn-more"
            >
              Learn More About HealSync
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">10,000+</h3>
            <p className="text-gray-600 dark:text-gray-300">Doctors Trust Us</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">500K+</h3>
            <p className="text-gray-600 dark:text-gray-300">Patients Managed</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</h3>
            <p className="text-gray-600 dark:text-gray-300">Uptime Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
}