import { useState } from "react";
import { PatientForm } from "@/components/PatientForm";
import { PatientList } from "@/components/PatientList";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function Patients() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient records, medical history, and files.
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("register")}
          data-testid="button-new-patient"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-patient-list">Patient List</TabsTrigger>
          <TabsTrigger value="register" data-testid="tab-register-patient">Register Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <PatientList />
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          <PatientForm onSubmit={(data) => {
            console.log('Patient registered:', data);
            setActiveTab("list");
          }} />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <FileUpload onUpload={(files) => {
            console.log('Files uploaded:', files);
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}