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
import { useToast } from "@/hooks/use-toast";

const billingFormSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  paymentMethod: z.string().optional(),
});

type BillingFormData = z.infer<typeof billingFormSchema>;

interface BillingFormProps {
  onSubmit?: (data: BillingFormData) => void;
  initialData?: Partial<BillingFormData>;
  isEditing?: boolean;
}

export function BillingForm({ onSubmit, initialData, isEditing = false }: BillingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patientName: initialData?.patientName || "",
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      paymentMethod: initialData?.paymentMethod || "",
    },
  });

  const handleSubmit = async (data: BillingFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Bill generated:', data);
      onSubmit?.(data);
      toast({
        title: isEditing ? "Bill Updated" : "Bill Generated",
        description: `Bill for ${data.patientName} has been ${isEditing ? 'updated' : 'generated'}.`,
      });
      
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'generate'} bill. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Bill" : "Generate New Bill"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient name" data-testid="input-patient-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      data-testid="input-amount" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter service description"
                      className="resize-none"
                      data-testid="input-description"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-bill">
              {isSubmitting ? "Generating..." : isEditing ? "Update Bill" : "Generate Bill"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}