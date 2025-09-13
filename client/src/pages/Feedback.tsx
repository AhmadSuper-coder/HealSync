import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, PlusCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertFeedbackRequestSchema, type FeedbackRequest } from "@shared/schema";

const feedbackFormSchema = insertFeedbackRequestSchema.extend({
  doctorId: z.string().default("demo-doctor-id") // Mock doctor ID for demo
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

export function Feedback() {
  const [showCreateFeedback, setShowCreateFeedback] = useState(false);
  const { toast } = useToast();

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

  // Fetch feedback
  const { data: feedbackList = [] } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback?doctorId=demo-doctor-id');
      if (!response.ok) throw new Error('Failed to fetch feedback');
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Feedback & Suggestions</h1>
          <p className="text-muted-foreground mt-2">
            Share your suggestions and feature requests to help us improve the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Your Feedback
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submit suggestions, feature requests, or bug reports
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
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'N/A'}
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
      </div>
    </div>
  );
}