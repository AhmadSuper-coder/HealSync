import { useState, useEffect } from "react";
import { Search, Edit, Eye, FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Patient } from "../types/patients";
import PatientAPI from "../lib/django-api/patient.ts"

// todo: remove mock functionality
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    age: 45,
    gender: "Male",
    phone: "+91 9876543210",
    lastVisit: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Priya Patel",
    age: 32,
    gender: "Female",
    phone: "+91 9876543211",
    lastVisit: "2024-01-10",
    status: "active",
  },
  {
    id: "3",
    name: "Amit Kumar",
    age: 28,
    gender: "Male",
    phone: "+91 9876543212",
    lastVisit: "2023-12-20",
    status: "inactive",
  },
  {
    id: "4",
    name: "Sunita Singh",
    age: 38,
    gender: "Female",
    phone: "+91 9876543213",
    lastVisit: "2024-01-12",
    status: "active",
  },
  {
    id: "5",
    name: "Vikram Patel",
    age: 52,
    gender: "Male",
    phone: "+91 9876543214",
    lastVisit: "2024-01-08",
    status: "active",
  },
];

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

    // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await PatientAPI.getPatientList(); // hit your backend endpoint\
        console.log("Response from Django API:", response);
        setPatients(response);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const handleViewPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}`);
  };

  const handleEditPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}/edit`);
  };

  const handleCallPatient = (patient: Patient) => {
    console.log('Call patient:', patient.phone);
  };

  const handleViewHistory = (patient: Patient) => {
    console.log('View patient medical history:', patient.id);
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Patient List ({filteredPatients.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
                data-testid="input-search-patients"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading patients...</p>
          </div>
        ) :(
        <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} data-testid={`patient-row-${patient.id}`}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(patient.status) as any}>
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`button-actions-${patient.id}`}>
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCallPatient(patient)}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewHistory(patient)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Medical History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No patients found matching your search.</p>
          </div>
        )}

        </>
        )}
      </CardContent>
    </Card>
  );
}