import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PatientAPI } from "@/lib/django-api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
}

interface PatientDropdownProps {
  value?: string;
  onSelect: (patient: Patient | null) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
}

export function PatientDropdown({ 
  value, 
  onSelect, 
  placeholder = "Select patient...", 
  disabled = false,
  testId = "patient-dropdown"
}: PatientDropdownProps) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await PatientAPI.getAll({ limit: 100 });
      const data = await response.json();
      // Handle Django API response format (results array)
      setPatients(data.results || data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatient = patients.find(patient => patient.id === value);

  const formatPatientDisplay = (patient: Patient) => {
    return `${patient.phone} - ${patient.name}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
          data-testid={testId}
        >
          {selectedPatient ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate">{formatPatientDisplay(selectedPatient)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search patients..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading patients..." : "No patients found."}
            </CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={formatPatientDisplay(patient)}
                  onSelect={() => {
                    onSelect(patient.id === value ? null : patient);
                    setOpen(false);
                  }}
                  data-testid={`patient-option-${patient.id}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{formatPatientDisplay(patient)}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.age} years, {patient.gender}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}