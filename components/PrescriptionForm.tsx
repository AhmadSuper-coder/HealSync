import { useState, useEffect } from "react";
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
import { PatientDropdown } from "./PatientDropdown";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
});

const prescriptionFormSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
}

interface PrescriptionFormProps {
  onSubmit?: (data: PrescriptionFormData & { patientName: string; patientPhone: string }) => void;
  initialData?: Partial<PrescriptionFormData>;
  isEditing?: boolean;
  preselectedPatientId?: string;
}

export function PrescriptionForm({ onSubmit, initialData, isEditing = false, preselectedPatientId }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const { toast } = useToast();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientId: preselectedPatientId || initialData?.patientId || "",
      medicines: initialData?.medicines || [{ name: "", dosage: "", frequency: "", duration: "" }],
      instructions: initialData?.instructions || "",
      followUpDate: initialData?.followUpDate || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
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

  const handleSubmit = async (data: PrescriptionFormData) => {
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
      const prescriptionData = {
        ...data,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
      };

      // Mark previous prescriptions as completed if this is a new prescription
      if (!isEditing) {
        try {
          await fetch(`/api/patients/${selectedPatient.id}/prescriptions/complete`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Failed to mark previous prescriptions as completed:', error);
          // Continue with creating new prescription even if this fails
        }
      }

      // Create prescription via API
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });

      if (response.ok) {
        onSubmit?.(prescriptionData);
        toast({
          title: isEditing ? "Prescription Updated" : "Prescription Created",
          description: `Prescription for ${selectedPatient.name} has been ${isEditing ? 'updated' : 'created'}.`,
        });
        
        if (!isEditing) {
          form.reset();
          setSelectedPatient(null);
          // Reset to single medicine entry
          form.setValue("medicines", [{ name: "", dosage: "", frequency: "", duration: "" }]);
        }
      } else {
        throw new Error('Failed to create prescription');
      }
    } catch (error) {
      console.error('Prescription submission error:', error);
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
                      testId="patient-dropdown-prescription"
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