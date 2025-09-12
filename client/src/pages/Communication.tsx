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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Bell, Users } from "lucide-react";

const messageFormSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Message type is required"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

interface Message {
  id: string;
  recipient: string;
  subject: string;
  type: "reminder" | "health-tip" | "follow-up" | "appointment";
  status: "sent" | "delivered" | "failed";
  sentAt: string;
}

export default function Communication() {
  const [activeTab, setActiveTab] = useState("send");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // todo: remove mock functionality
  const sentMessages: Message[] = [
    {
      id: "1",
      recipient: "Rajesh Sharma",
      subject: "Appointment Reminder",
      type: "reminder",
      status: "delivered",
      sentAt: "2024-01-15 10:30",
    },
    {
      id: "2",
      recipient: "All Patients",
      subject: "Winter Health Tips",
      type: "health-tip",
      status: "sent",
      sentAt: "2024-01-14 09:00",
    },
    {
      id: "3",
      recipient: "Priya Patel",
      subject: "Follow-up Required",
      type: "follow-up",
      status: "delivered",
      sentAt: "2024-01-13 14:15",
    },
  ];

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipient: "",
      subject: "",
      message: "",
      type: "",
    },
  });

  const handleSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Message sent:', data);
      toast({
        title: "Message Sent",
        description: `Message sent to ${data.recipient} successfully.`,
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "sent":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return Bell;
      case "health-tip":
        return MessageSquare;
      case "follow-up":
        return Users;
      default:
        return MessageSquare;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
        <p className="text-muted-foreground">
          Send reminders, health tips, and communicate with patients.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send" data-testid="tab-send-message">Send Message</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-message-history">Message History</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-message-templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <FormControl>
                            <Input placeholder="Search patient or select 'All Patients'" data-testid="input-recipient" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-message-type">
                                <SelectValue placeholder="Select message type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reminder">Appointment Reminder</SelectItem>
                              <SelectItem value="health-tip">Health Tip</SelectItem>
                              <SelectItem value="follow-up">Follow-up</SelectItem>
                              <SelectItem value="announcement">Clinic Announcement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter message subject" data-testid="input-subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here..."
                            className="min-h-32 resize-none"
                            data-testid="input-message"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                      data-testid="button-send-message"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        console.log('Schedule message for later');
                        toast({
                          title: "Schedule Message",
                          description: "Message scheduling feature coming soon.",
                        });
                      }}
                      data-testid="button-schedule-message"
                    >
                      Schedule Later
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentMessages.map((message) => {
                  const Icon = getTypeIcon(message.type);
                  return (
                    <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{message.subject}</p>
                          <p className="text-sm text-muted-foreground">To: {message.recipient}</p>
                          <p className="text-xs text-muted-foreground">{message.sentAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(message.status) as any}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Appointment Reminder",
                description: "Remind patients about upcoming appointments",
                template: "Dear [Patient Name], this is a reminder for your appointment on [Date] at [Time].",
              },
              {
                title: "Medicine Refill",
                description: "Remind patients to refill their medicines",
                template: "Dear [Patient Name], it's time to refill your homeopathic medicines.",
              },
              {
                title: "Follow-up Required",
                description: "Request patients to schedule follow-up",
                template: "Dear [Patient Name], please schedule your follow-up appointment.",
              },
              {
                title: "Health Tips",
                description: "Share seasonal health tips",
                template: "Stay healthy this season with these homeopathic tips...",
              },
            ].map((template, index) => (
              <Card key={index} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <p className="text-xs bg-muted p-2 rounded italic">{template.template}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => {
                      form.setValue('subject', template.title);
                      form.setValue('message', template.template);
                      setActiveTab('send');
                    }}
                    data-testid={`button-use-template-${index}`}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}