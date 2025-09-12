import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
});

const prescriptionFormSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

interface PrescriptionFormProps {
  onSubmit?: (data: PrescriptionFormData) => void;
  initialData?: Partial<PrescriptionFormData>;
  isEditing?: boolean;
}

export function PrescriptionForm({ onSubmit, initialData, isEditing = false }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientName: initialData?.patientName || "",
      medicines: initialData?.medicines || [{ name: "", dosage: "", frequency: "", duration: "" }],
      instructions: initialData?.instructions || "",
      followUpDate: initialData?.followUpDate || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  const handleSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Prescription created:', data);
      onSubmit?.(data);
      toast({
        title: isEditing ? "Prescription Updated" : "Prescription Created",
        description: `Prescription for ${data.patientName} has been ${isEditing ? 'updated' : 'created'}.`,
      });
      
      if (!isEditing) {
        form.reset();
        // Reset to single medicine entry
        form.setValue("medicines", [{ name: "", dosage: "", frequency: "", duration: "" }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} prescription. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMedicine = () => {
    append({ name: "", dosage: "", frequency: "", duration: "" });
  };

  const removeMedicine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Prescription" : "Create New Prescription"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Patient Information */}
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

            {/* Medicines Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medicines</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedicine}
                  data-testid="button-add-medicine"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Medicine {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicine(index)}
                        data-testid={`button-remove-medicine-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Arnica 30C" 
                              data-testid={`input-medicine-name-${index}`}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 5 drops" 
                              data-testid={`input-medicine-dosage-${index}`}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 3 times a day" 
                              data-testid={`input-medicine-frequency-${index}`}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 15 days" 
                              data-testid={`input-medicine-duration-${index}`}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions for the patient"
                        className="resize-none"
                        data-testid="input-instructions"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        data-testid="input-followup-date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-prescription">
              {isSubmitting ? "Saving..." : isEditing ? "Update Prescription" : "Create Prescription"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}