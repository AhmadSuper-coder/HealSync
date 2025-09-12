import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  mobile: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OTPVerification({ mobile, onVerificationSuccess, onBack, isLoading = false }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "OTP Verified",
          description: "Mobile number verified successfully!",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your mobile number.",
        });
        setCountdown(60);
        setCanResend(false);
        setOtp("");
      }
    } catch (error) {
      console.error('OTP resend error:', error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOTPChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerifyOTP();
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Verify Mobile Number</CardTitle>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          {mobile}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter OTP</label>
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => handleOTPChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
            disabled={isLoading || isVerifying}
            data-testid="input-otp"
          />
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit code sent to your mobile
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isVerifying || isLoading}
            className="w-full"
            data-testid="button-verify-otp"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center space-y-2">
            {!canResend ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in {countdown} seconds
              </p>
            ) : (
              <Button
                variant="outline"
                onClick={handleResendOTP}
                className="text-sm"
                data-testid="button-resend-otp"
              >
                Resend OTP
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
            disabled={isLoading || isVerifying}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Mobile Number
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            For demo: Use OTP <span className="font-mono font-bold">123456</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}