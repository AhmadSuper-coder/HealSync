import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock, User, Phone } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: string;
  type: "consultation" | "follow-up" | "emergency";
  status: "scheduled" | "completed" | "cancelled";
  phone?: string;
}

// todo: remove mock functionality
const mockAppointments: Record<string, Appointment[]> = {
  "2024-01-15": [
    {
      id: "1",
      patientName: "Rajesh Sharma",
      time: "10:00",
      duration: "30 min",
      type: "consultation",
      status: "scheduled",
      phone: "+91 9876543210",
    },
    {
      id: "2",
      patientName: "Priya Patel",
      time: "11:00",
      duration: "45 min",
      type: "follow-up",
      status: "scheduled",
      phone: "+91 9876543211",
    },
  ],
  "2024-01-16": [
    {
      id: "3",
      patientName: "Amit Kumar",
      time: "15:00",
      duration: "30 min",
      type: "consultation",
      status: "scheduled",
      phone: "+91 9876543212",
    },
  ],
};

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const appointments = selectedDateStr ? mockAppointments[selectedDateStr] || [] : [];

  const handleCallPatient = (appointment: Appointment) => {
    console.log('Call patient:', appointment.phone);
  };

  const handleMarkComplete = (appointment: Appointment) => {
    console.log('Mark appointment complete:', appointment.id);
  };

  const handleReschedule = (appointment: Appointment) => {
    console.log('Reschedule appointment:', appointment.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "follow-up":
        return "bg-green-100 text-green-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            data-testid="appointment-calendar"
          />
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Appointments for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointments scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`appointment-item-${appointment.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{appointment.patientName}</span>
                        <Badge 
                          variant={getStatusColor(appointment.status) as any}
                          className="ml-2"
                        >
                          {appointment.status}
                        </Badge>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time} ({appointment.duration})</span>
                        </div>
                        {appointment.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {appointment.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallPatient(appointment)}
                          data-testid={`button-call-${appointment.id}`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {appointment.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(appointment)}
                            data-testid={`button-complete-${appointment.id}`}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(appointment)}
                            data-testid={`button-reschedule-${appointment.id}`}
                          >
                            Reschedule
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}