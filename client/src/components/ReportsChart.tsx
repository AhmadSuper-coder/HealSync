import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// todo: remove mock functionality
const patientData = [
  { month: "Jan", patients: 240, revenue: 45000 },
  { month: "Feb", patients: 300, revenue: 52000 },
  { month: "Mar", patients: 280, revenue: 48000 },
  { month: "Apr", patients: 320, revenue: 58000 },
  { month: "May", patients: 350, revenue: 62000 },
  { month: "Jun", patients: 380, revenue: 68000 },
];

const appointmentStatusData = [
  { name: "Completed", value: 65, color: "#22c55e" },
  { name: "Scheduled", value: 25, color: "#3b82f6" },
  { name: "Cancelled", value: 8, color: "#ef4444" },
  { name: "No Show", value: 2, color: "#6b7280" },
];

const paymentStatusData = [
  { month: "Jan", paid: 42000, pending: 3000 },
  { month: "Feb", paid: 48000, pending: 4000 },
  { month: "Mar", paid: 44000, pending: 4000 },
  { month: "Apr", paid: 54000, pending: 4000 },
  { month: "May", paid: 58000, pending: 4000 },
  { month: "Jun", paid: 64000, pending: 4000 },
];

export function ReportsChart() {
  const [chartType, setChartType] = useState("patients");

  const renderChart = () => {
    switch (chartType) {
      case "patients":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#22c55e" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "appointments":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case "payments":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="paid" fill="#22c55e" />
              <Bar dataKey="pending" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analytics Overview</CardTitle>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-48" data-testid="select-chart-type">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patients">Patient Growth</SelectItem>
              <SelectItem value="revenue">Revenue Trends</SelectItem>
              <SelectItem value="appointments">Appointment Status</SelectItem>
              <SelectItem value="payments">Payment Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}