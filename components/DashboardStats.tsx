import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Receipt, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  changeType: "positive" | "negative" | "neutral";
}

function StatCard({ title, value, change, icon: Icon, changeType }: StatCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // todo: remove mock functionality
  const stats = [
    {
      title: "Total Patients",
      value: "2,847",
      change: "+12% from last month",
      icon: Users,
      changeType: "positive" as const,
    },
    {
      title: "Today's Appointments",
      value: "23",
      change: "4 pending confirmations",
      icon: Calendar,
      changeType: "neutral" as const,
    },
    {
      title: "Monthly Revenue",
      value: "₹1,24,500",
      change: "+8% from last month",
      icon: Receipt,
      changeType: "positive" as const,
    },
    {
      title: "Patient Retention",
      value: "89%",
      change: "+2% from last quarter",
      icon: TrendingUp,
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}