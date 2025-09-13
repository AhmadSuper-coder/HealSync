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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Upload, Save, Shield, Bell } from "lucide-react";

const clinicFormSchema = z.object({
  clinicName: z.string().min(2, "Clinic name is required"),
  doctorName: z.string().min(2, "Doctor name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  qualifications: z.string().optional(),
  specialization: z.string().optional(),
});

type ClinicFormData = z.infer<typeof clinicFormSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("clinic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // todo: remove mock functionality
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    appointmentAlerts: true,
    paymentAlerts: false,
    marketingEmails: false,
  });

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      clinicName: "HomeoClinic Wellness Center",
      doctorName: "Dr. Sarah Johnson",
      email: "dr.sarah@homeoclinic.com",
      phone: "+91 9876543210",
      address: "123 Health Street, Medical District, City - 400001",
      qualifications: "BHMS, MD (Homeopathy)",
      specialization: "General Homeopathy, Chronic Diseases",
    },
  });

  const handleSubmit = async (data: ClinicFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Clinic settings updated:', data);
      toast({
        title: "Settings Updated",
        description: "Your clinic settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = () => {
    console.log('Logo upload triggered');
    toast({
      title: "Logo Upload",
      description: "Logo upload feature will be implemented.",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your clinic profile, preferences, and system settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clinic" data-testid="tab-clinic-settings">Clinic Profile</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notification-settings">Notifications</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security-settings">Security</TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance-settings">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">HC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium mb-2">Clinic Logo</h3>
                  <Button variant="outline" onClick={handleLogoUpload} data-testid="button-upload-logo">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clinicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Name</FormLabel>
                          <FormControl>
                            <Input data-testid="input-clinic-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor Name</FormLabel>
                          <FormControl>
                            <Input data-testid="input-doctor-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" data-testid="input-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input data-testid="input-phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea className="resize-none" data-testid="input-address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="qualifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualifications</FormLabel>
                          <FormControl>
                            <Input data-testid="input-qualifications" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input data-testid="input-specialization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} data-testid="button-save-clinic">
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'emailReminders', label: 'Email Reminders', description: 'Receive appointment reminders via email' },
                { key: 'smsReminders', label: 'SMS Reminders', description: 'Receive appointment reminders via SMS' },
                { key: 'appointmentAlerts', label: 'Appointment Alerts', description: 'Get notified about new appointments' },
                { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Receive notifications for payments' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive updates about new features' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(value) => handleNotificationChange(item.key, value)}
                    data-testid={`switch-${item.key}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline" data-testid="button-change-password">
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" data-testid="button-setup-2fa">
                    Setup 2FA
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Backup</h4>
                    <p className="text-sm text-muted-foreground">Download your clinic data</p>
                  </div>
                  <Button variant="outline" data-testid="button-backup-data">
                    Download Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Language</h4>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
                <Button variant="outline" data-testid="button-change-language">
                  English
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Time Zone</h4>
                  <p className="text-sm text-muted-foreground">Set your local time zone</p>
                </div>
                <Button variant="outline" data-testid="button-change-timezone">
                  UTC +05:30
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}