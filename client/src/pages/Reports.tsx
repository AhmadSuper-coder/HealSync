import { ReportsChart } from "@/components/ReportsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Download, TrendingUp, Users, Calendar, Receipt } from "lucide-react";
import { useState } from "react";

interface ReportMetric {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

export default function Reports() {
  const [reportType, setReportType] = useState("monthly");

  // todo: remove mock functionality
  const metrics: ReportMetric[] = [
    {
      title: "New Patients",
      value: "127",
      change: "+12% from last month",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Appointments Completed",
      value: "342",
      change: "+8% from last month",
      changeType: "positive",
      icon: Calendar,
    },
    {
      title: "Revenue Generated",
      value: "₹1,24,500",
      change: "+15% from last month",
      changeType: "positive",
      icon: Receipt,
    },
    {
      title: "Patient Retention Rate",
      value: "89%",
      change: "+2% from last quarter",
      changeType: "positive",
      icon: TrendingUp,
    },
  ];

  const handleExportReport = () => {
    console.log('Export report triggered');
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your clinic performance.
          </p>
        </div>
        <Button onClick={handleExportReport} data-testid="button-export-report">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-80">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${getChangeColor(metric.changeType)}`}>
                      {metric.change}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsChart />
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: "General Consultation", revenue: "₹45,600", percentage: 60 },
                { service: "Follow-up Appointments", revenue: "₹28,400", percentage: 37 },
                { service: "Prescription Renewals", revenue: "₹12,800", percentage: 17 },
                { service: "Health Check-ups", revenue: "₹8,200", percentage: 11 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.service}</p>
                    <p className="text-sm text-muted-foreground">{item.revenue}</p>
                  </div>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { group: "Adults (25-50 years)", count: 145, percentage: 58 },
                { group: "Seniors (50+ years)", count: 78, percentage: 31 },
                { group: "Young Adults (18-25 years)", count: 23, percentage: 9 },
                { group: "Children (0-18 years)", count: 4, percentage: 2 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.group}</p>
                    <p className="text-sm text-muted-foreground">{item.count} patients</p>
                  </div>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}