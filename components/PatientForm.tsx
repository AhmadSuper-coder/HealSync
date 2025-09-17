import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { OTPVerification } from "./OTPVerification";
import { FileUpload } from "./FileUpload";
import { Phone, User, FileImage, CheckCircle } from "lucide-react";
import { AuthAPI, PatientAPI } from "@/lib/django-api";

const mobileSchema = z.object({
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
});

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  lifestyle: z.string().optional(),
});

type MobileFormData = z.infer<typeof mobileSchema>;
type PatientFormData = z.infer<typeof patientFormSchema>;

// Type for the API payload with age as number
type PatientPayload = Omit<PatientFormData, 'age'> & { age: number };

interface PatientFormProps {
  onSubmit?: (data: PatientPayload) => void;
  initialData?: Partial<PatientFormData & { id?: string }>;
  isEditing?: boolean;
}

export function PatientForm({ onSubmit, initialData, isEditing = false }: PatientFormProps) {
  const [step, setStep] = useState<"mobile" | "otp" | "details">(isEditing ? "details" : "mobile");
  const [verifiedMobile, setVerifiedMobile] = useState(initialData?.mobile || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const mobileForm = useForm<MobileFormData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: {
      mobile: initialData?.mobile || "",
    },
  });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      age: initialData?.age || "",
      gender: initialData?.gender || "",
      mobile: initialData?.mobile || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      emergencyContact: initialData?.emergencyContact || "",
      allergies: initialData?.allergies || "",
      medicalHistory: initialData?.medicalHistory || "",
      lifestyle: initialData?.lifestyle || "",
    },
  });

  const handleSendOTP = async (data: MobileFormData) => {
    setIsSendingOTP(true);
    try {
      const response = await AuthAPI.sendOTP(data.mobile);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setVerifiedMobile(data.mobile);
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${data.mobile}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleOTPVerification = () => {
    setStep("details");
    patientForm.setValue("mobile", verifiedMobile);
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setVerifiedMobile("");
  };

  const handlePatientSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        age: Number(data.age), // Convert age string to number
        mobile: verifiedMobile || data.mobile,
      };

      if (isEditing) {
        // Update patient
        const response = await PatientAPI.update(Number(initialData?.id), payload);
        
        if (response.ok) {
          toast({
            title: "Patient Updated",
            description: `${data.name} has been updated successfully.`,
          });
        }
      } else {
        // Create new patient
        const response = await PatientAPI.create(payload);
        
        if (response.ok) {
          toast({
            title: "Patient Registered",
            description: `${data.name} has been registered successfully.`,
          });
          patientForm.reset();
          setStep("mobile");
          setVerifiedMobile("");
        }
      }

      onSubmit?.(payload);
    } catch (error) {
      console.error('Patient submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'register'} patient. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "mobile") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Patient Registration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter patient's mobile number to get started
          </p>
        </CardHeader>
        <CardContent>
          <Form {...mobileForm}>
            <form onSubmit={mobileForm.handleSubmit(handleSendOTP)} className="space-y-6">
              <FormField
                control={mobileForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 9876543210"
                        data-testid="input-mobile"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSendingOTP}
                data-testid="button-send-otp"
              >
                {isSendingOTP ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (step === "otp") {
    return (
      <OTPVerification
        mobile={verifiedMobile}
        onVerificationSuccess={handleOTPVerification}
        onBack={handleBackToMobile}
        isLoading={false}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <CardTitle>{isEditing ? "Edit Patient" : "Patient Details"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mobile verified: {verifiedMobile || patientForm.getValues("mobile")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" data-testid="tab-basic-info">
              <User className="mr-2 h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="medical" data-testid="tab-medical-info">Medical History</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">
              <FileImage className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <Form {...patientForm}>
            <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="mt-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={patientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" data-testid="input-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter age" data-testid="input-age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={patientForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" data-testid="input-email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={patientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter complete address"
                          className="resize-none"
                          data-testid="input-address"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Emergency contact number"
                          data-testid="input-emergency-contact"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <FormField
                  control={patientForm.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Allergies (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List any known allergies or reactions"
                          className="resize-none"
                          data-testid="input-allergies"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Previous illnesses, surgeries, chronic conditions"
                          className="resize-none min-h-32"
                          data-testid="input-medical-history"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="lifestyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lifestyle Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Diet, exercise, sleep patterns, stress levels"
                          className="resize-none"
                          data-testid="input-lifestyle"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Upload Previous Prescription Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload images of previous prescriptions, medical reports, or other relevant documents.
                  </p>
                  <FileUpload 
                    patientId={patientForm.getValues("mobile")}
                    onUpload={(files) => {
                      console.log('Prescription images uploaded:', files);
                      toast({
                        title: "Files Uploaded",
                        description: `${files.length} file(s) uploaded successfully.`,
                      });
                    }}
                  />
                </div>
              </TabsContent>

              <div className="flex gap-4 mt-8">
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToMobile}
                    data-testid="button-change-mobile"
                  >
                    Change Mobile Number
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  data-testid="button-submit-patient"
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Update Patient" : "Register Patient"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}