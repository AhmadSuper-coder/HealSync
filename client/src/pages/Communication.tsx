import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Bell, Users, Phone, Mail, CheckCircle, Megaphone, PlusCircle, Edit2, Pin, UnPin, Clock, AlertCircle, Star } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertFeedbackRequestSchema, insertAnnouncementSchema, type FeedbackRequest, type Announcement } from "@shared/schema";

// Communication channel pricing (in INR)
const CHANNEL_PRICING = {
  whatsapp: { price: 0.25, label: "WhatsApp", icon: SiWhatsapp, description: "₹0.25 per message" },
  email: { price: 0.10, label: "Email", icon: Mail, description: "₹0.10 per message" },
  sms: { price: 1.50, label: "SMS", icon: Phone, description: "₹1.50 per message" },
} as const;

type CommunicationChannel = keyof typeof CHANNEL_PRICING;

const messageFormSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Message type is required"),
  channel: z.string().min(1, "Communication channel is required"),
});

const feedbackFormSchema = insertFeedbackRequestSchema.extend({
  doctorId: z.string().default("demo-doctor-id") // Mock doctor ID for demo
});

const announcementFormSchema = insertAnnouncementSchema.extend({
  createdBy: z.string().default("demo-admin-id") // Mock admin ID for demo
});

type MessageFormData = z.infer<typeof messageFormSchema>;
type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
type AnnouncementFormData = z.infer<typeof announcementFormSchema>;

interface Message {
  id: string;
  recipient: string;
  subject: string;
  type: "reminder" | "health-tip" | "follow-up" | "appointment";
  channel: CommunicationChannel;
  cost: number;
  status: "sent" | "delivered" | "failed";
  sentAt: string;
}

export default function Communication() {
  const [activeTab, setActiveTab] = useState("send");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>("whatsapp");
  const [recipientCount, setRecipientCount] = useState(1);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateFeedback, setShowCreateFeedback] = useState(false);
  const [isAdmin] = useState(true); // Mock admin status for demo
  const { toast } = useToast();

  // todo: remove mock functionality
  const sentMessages: Message[] = [
    {
      id: "1",
      recipient: "Rajesh Sharma",
      subject: "Appointment Reminder",
      type: "reminder",
      channel: "whatsapp",
      cost: 0.25,
      status: "delivered",
      sentAt: "2024-01-15 10:30",
    },
    {
      id: "2",
      recipient: "All Patients (50)",
      subject: "Winter Health Tips",
      type: "health-tip",
      channel: "email",
      cost: 5.00,
      status: "sent",
      sentAt: "2024-01-14 09:00",
    },
    {
      id: "3",
      recipient: "Priya Patel",
      subject: "Follow-up Required",
      type: "follow-up",
      channel: "sms",
      cost: 1.50,
      status: "delivered",
      sentAt: "2024-01-13 14:15",
    },
  ];

  // Forms for different functionalities
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipient: "",
      subject: "",
      message: "",
      type: "",
      channel: "whatsapp",
    },
  });

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      doctorId: "demo-doctor-id",
      title: "",
      type: "suggestion",
      description: "",
      status: "open",
    },
  });

  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      message: "",
      category: "feature",
      audience: "all",
      isPinned: false,
      createdBy: "demo-admin-id",
    },
  });

  // Fetch feedback and announcements
  const { data: feedbackList = [] } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback?doctorId=demo-doctor-id');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  });

  // Feedback submission mutation
  const createFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      return apiRequest('POST', '/api/feedback', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      feedbackForm.reset();
      setShowCreateFeedback(false);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback. We'll review it soon."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Announcement creation mutation (admin only)
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      return apiRequest('POST', '/api/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      announcementForm.reset();
      setShowCreateAnnouncement(false);
      toast({
        title: "Announcement Created",
        description: "Announcement published successfully to all clinics."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Calculate estimated cost
  const estimatedCost = recipientCount * CHANNEL_PRICING[selectedChannel].price;

  const handleSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);
    try {
      // Add channel and cost information
      const messageData = {
        ...data,
        channel: selectedChannel,
        cost: estimatedCost,
        recipientCount,
      };
      
      console.log('Message sent:', messageData);
      toast({
        title: "Message Sent",
        description: `Message sent via ${CHANNEL_PRICING[selectedChannel].label} to ${data.recipient}. Cost: ₹${estimatedCost.toFixed(2)}`,
      });
      form.reset();
      form.setValue('channel', 'whatsapp');
      setRecipientCount(1);
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

      {/* Communication Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(Object.entries(CHANNEL_PRICING) as [CommunicationChannel, typeof CHANNEL_PRICING[CommunicationChannel]][]).map(([channel, info]) => {
          const Icon = info.icon;
          return (
            <Card key={channel} className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{info.label}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send" data-testid="tab-send-message">Send Message</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-message-history">Message History</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-message-templates">Templates</TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">Announcements</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          {/* Channel Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Communication Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.entries(CHANNEL_PRICING) as [CommunicationChannel, typeof CHANNEL_PRICING[CommunicationChannel]][]).map(([channel, info]) => {
                  const Icon = info.icon;
                  const isSelected = selectedChannel === channel;
                  return (
                    <div
                      key={channel}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedChannel(channel);
                        form.setValue('channel', channel);
                      }}
                      data-testid={`channel-option-${channel}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{info.label}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 text-primary ml-auto" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Compose Message</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-lg font-bold text-primary">₹{estimatedCost.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Search patient or select 'All Patients'"
                              data-testid="input-recipient"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-detect recipient count for cost calculation
                                const value = e.target.value.toLowerCase();
                                if (value.includes('all patients') || value.includes('all')) {
                                  setRecipientCount(50); // Assume 50 patients for demo
                                } else {
                                  setRecipientCount(1);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedChannel(value as CommunicationChannel);
                          }} value={selectedChannel}>
                            <FormControl>
                              <SelectTrigger data-testid="select-channel">
                                <SelectValue placeholder="Select channel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.entries(CHANNEL_PRICING) as [CommunicationChannel, typeof CHANNEL_PRICING[CommunicationChannel]][]).map(([channel, info]) => (
                                <SelectItem key={channel} value={channel}>
                                  {info.label} - {info.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={getStatusColor(message.status) as any}>
                            {message.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {React.createElement(CHANNEL_PRICING[message.channel].icon, { className: "h-3 w-3" })}
                            <span>₹{message.cost.toFixed(2)}</span>
                          </div>
                        </div>
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

        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Global Announcements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    System-wide updates and notifications for all clinics
                  </p>
                </div>
                {isAdmin && (
                  <Dialog open={showCreateAnnouncement} onOpenChange={setShowCreateAnnouncement}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-announcement">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                      </DialogHeader>
                      <Form {...announcementForm}>
                        <form onSubmit={announcementForm.handleSubmit((data) => createAnnouncementMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={announcementForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Announcement title" data-testid="input-announcement-title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={announcementForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-announcement-category">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="feature">New Feature</SelectItem>
                                      <SelectItem value="pricing">Pricing Update</SelectItem>
                                      <SelectItem value="update">System Update</SelectItem>
                                      <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={announcementForm.control}
                              name="isPinned"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pin Announcement</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        data-testid="checkbox-pin-announcement"
                                        className="h-4 w-4"
                                      />
                                      <span className="text-sm">Pin to top</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={announcementForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Announcement message..."
                                    className="min-h-32"
                                    data-testid="textarea-announcement-message"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2 pt-4">
                            <Button 
                              type="submit" 
                              disabled={createAnnouncementMutation.isPending}
                              className="flex-1"
                              data-testid="button-submit-announcement"
                            >
                              {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowCreateAnnouncement(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement: Announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`announcement-${announcement.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {announcement.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                          <Badge variant={
                            announcement.category === 'feature' ? 'default' :
                            announcement.category === 'pricing' ? 'destructive' :
                            announcement.category === 'update' ? 'secondary' : 'outline'
                          }>
                            {announcement.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No announcements yet.</p>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowCreateAnnouncement(true)}
                        data-testid="button-create-first-announcement"
                      >
                        Create First Announcement
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Feedback & Suggestions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Share your suggestions and feature requests
                  </p>
                </div>
                <Dialog open={showCreateFeedback} onOpenChange={setShowCreateFeedback}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-feedback">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Feedback</DialogTitle>
                    </DialogHeader>
                    <Form {...feedbackForm}>
                      <form onSubmit={feedbackForm.handleSubmit((data) => createFeedbackMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={feedbackForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief title for your feedback" data-testid="input-feedback-title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={feedbackForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-feedback-type">
                                    <SelectValue placeholder="Select feedback type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="suggestion">Suggestion</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="bug">Bug Report</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={feedbackForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe your feedback in detail..."
                                  className="min-h-32"
                                  data-testid="textarea-feedback-description"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createFeedbackMutation.isPending}
                            className="flex-1"
                            data-testid="button-submit-feedback"
                          >
                            {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowCreateFeedback(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackList.length > 0 ? (
                  feedbackList.map((feedback: FeedbackRequest) => (
                    <div key={feedback.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" data-testid={`feedback-${feedback.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            feedback.type === 'bug' ? 'destructive' :
                            feedback.type === 'feature' ? 'default' : 'secondary'
                          }>
                            {feedback.type}
                          </Badge>
                          <Badge variant={
                            feedback.status === 'done' ? 'default' :
                            feedback.status === 'in_progress' ? 'secondary' :
                            feedback.status === 'planned' ? 'outline' : 'secondary'
                          }>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{feedback.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No feedback submitted yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowCreateFeedback(true)}
                      data-testid="button-submit-first-feedback"
                    >
                      Submit First Feedback
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}