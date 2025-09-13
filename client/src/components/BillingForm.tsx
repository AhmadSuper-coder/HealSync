import { useState, useEffect } from "react";
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
import { PatientDropdown } from "./PatientDropdown";

const billingFormSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  paymentMethod: z.string().optional(),
  prescriptionId: z.string().optional(),
});

type BillingFormData = z.infer<typeof billingFormSchema>;

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
}

interface BillingFormProps {
  onSubmit?: (data: BillingFormData & { patientName: string; patientPhone: string }) => void;
  initialData?: Partial<BillingFormData>;
  isEditing?: boolean;
  prescriptionId?: string;
  preselectedPatientId?: string;
  preselectedPrescriptionId?: string;
}

export function BillingForm({ onSubmit, initialData, isEditing = false, prescriptionId, preselectedPatientId, preselectedPrescriptionId }: BillingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const { toast } = useToast();

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patientId: preselectedPatientId || initialData?.patientId || "",
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      paymentMethod: initialData?.paymentMethod || "",
      prescriptionId: initialData?.prescriptionId || preselectedPrescriptionId || prescriptionId || "",
    },
  });

  // Fetch patients and auto-select if preselectedPatientId is provided
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        const patientsData = await response.json();
        setPatients(patientsData);
        
        // Auto-select patient if preselectedPatientId is provided
        if (preselectedPatientId && patientsData.length > 0) {
          const patient = patientsData.find((p: Patient) => p.id === preselectedPatientId);
          if (patient) {
            setSelectedPatient(patient);
            form.setValue("patientId", patient.id);
          }
        }
        
        // Auto-select patient for editing scenario when only initialData.patientId is provided
        if (!preselectedPatientId && initialData?.patientId && patientsData.length > 0) {
          const patient = patientsData.find((p: Patient) => p.id === initialData.patientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };
    
    fetchPatients();
  }, [preselectedPatientId, form]);

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient?.id || "");
    if (patient) {
      form.clearErrors("patientId");
    }
  };

  const handleSubmit = async (data: BillingFormData) => {
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const billingData = {
        ...data,
        amount: parseInt(data.amount) * 100, // Convert to paise
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        prescriptionId: data.prescriptionId || preselectedPrescriptionId || prescriptionId || undefined,
      };

      // Create bill via API
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData),
      });

      if (response.ok) {
        onSubmit?.(billingData);
      } else {
        throw new Error('Failed to create bill');
      }
      toast({
        title: isEditing ? "Bill Updated" : "Bill Generated",
        description: `Bill for ${selectedPatient.name} has been ${isEditing ? 'updated' : 'generated'}.`,
      });
      
      if (!isEditing) {
        form.reset();
        setSelectedPatient(null);
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
            {/* Patient Selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Patient</FormLabel>
                  <FormControl>
                    <PatientDropdown
                      value={field.value}
                      onSelect={handlePatientSelect}
                      placeholder="Search and select patient..."
                      testId="patient-dropdown-billing"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Patient Info */}
            {selectedPatient && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Patient:</p>
                <p className="font-medium">{selectedPatient.phone} - {selectedPatient.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPatient.age} years, {selectedPatient.gender}</p>
              </div>
            )}

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