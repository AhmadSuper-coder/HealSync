import { useState } from "react";
import { BillingForm } from "@/components/BillingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Download, CreditCard } from "lucide-react";

interface Bill {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod?: string;
}

// todo: remove mock functionality
const mockBills: Bill[] = [
  {
    id: "1",
    patientName: "Rajesh Sharma",
    amount: 800,
    date: "2024-01-15",
    status: "paid",
    paymentMethod: "UPI",
  },
  {
    id: "2",
    patientName: "Priya Patel",
    amount: 1200,
    date: "2024-01-14",
    status: "pending",
  },
  {
    id: "3",
    patientName: "Amit Kumar",
    amount: 600,
    date: "2024-01-10",
    status: "overdue",
  },
];

export default function Billing() {
  const [activeTab, setActiveTab] = useState("list");

  const handleViewBill = (bill: Bill) => {
    console.log('View bill:', bill.id);
  };

  const handleDownloadInvoice = (bill: Bill) => {
    console.log('Download invoice:', bill.id);
  };

  const handleMarkPaid = (bill: Bill) => {
    console.log('Mark bill as paid:', bill.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const totalRevenue = mockBills
    .filter(bill => bill.status === "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const pendingAmount = mockBills
    .filter(bill => bill.status === "pending")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueAmount = mockBills
    .filter(bill => bill.status === "overdue")
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Generate invoices, track payments, and manage billing.
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("create")}
          data-testid="button-create-bill"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Bill
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">₹{overdueAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-bill-list">Bill List</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create-bill">Create Bill</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.patientName}</TableCell>
                      <TableCell>₹{bill.amount}</TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(bill.status) as any}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{bill.paymentMethod || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBill(bill)}
                            data-testid={`button-view-bill-${bill.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(bill)}
                            data-testid={`button-download-bill-${bill.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {bill.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(bill)}
                              data-testid={`button-mark-paid-${bill.id}`}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <BillingForm onSubmit={(data) => {
            console.log('Bill created:', data);
            setActiveTab("list");
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}