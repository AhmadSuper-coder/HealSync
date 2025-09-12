import { useState } from "react";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function Appointments() {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
          <p className="text-muted-foreground">
            Schedule, manage, and track patient appointments.
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("schedule")}
          data-testid="button-new-appointment"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar" data-testid="tab-appointment-calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule-appointment">Schedule New</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <AppointmentCalendar />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <AppointmentScheduler onSubmit={(data) => {
            console.log('Appointment scheduled:', data);
            setActiveTab("calendar");
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}