import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Eye, Edit, Download, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { BillingAPI } from "@/lib/django-api";
import { BillingForm } from "@/components/BillingForm";
import { ViewBillDialog } from "./ViewBillDialog";
import type { Bill } from "@shared/schema";

interface PatientBillingProps {
  patientId: string;
  patientData?: any;
  preselectedPrescriptionId?: string;
}

export function PatientBilling({ patientId, patientData, preselectedPrescriptionId: initialPrescriptionId }: PatientBillingProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | undefined>(initialPrescriptionId);
  const { toast } = useToast();

  // Fetch bills from API
  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ['bills', patientId],
    queryFn: async () => {
      const response = await BillingAPI.getAll({ patient_id: Number(patientId) });
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      return data.results || data;
    },
    enabled: !!patientId,
  });

  // Update bill status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'paid' | 'pending' }) => {
      const payload = status === 'paid' 
        ? { status, paidAt: new Date().toISOString() }
        : { status };
      
      const response = await BillingAPI.update(id, payload);
      if (!response.ok) throw new Error('Failed to update bill status');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills', patientId] });
      toast({
        title: "Success",
        description: `Bill marked as ${variables.status}`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive"
      });
    }
  });

  // Delete bill mutation
  const deleteMutation = useMutation({
    mutationFn: async (billId: number) => {
      const response = await BillingAPI.delete(billId);
      if (!response.ok) throw new Error('Failed to delete bill');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', patientId] });
      toast({
        title: "Bill Deleted",
        description: "Bill has been deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive"
      });
    }
  });

  const pendingBills = bills.filter((b: Bill) => b.status === 'pending').length;
  const paidBills = bills.filter((b: Bill) => b.status === 'paid').length;
  const totalPaid = bills
    .filter((b: Bill) => b.status === 'paid')
    .reduce((sum: number, b: Bill) => sum + b.amount, 0);

  const handleDialogOpenChange = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setPrescriptionId(undefined);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Invoices ({bills.length})
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-bill">
                <Plus className="mr-2 h-4 w-4" />
                Generate Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Bill</DialogTitle>
              </DialogHeader>
              <BillingForm 
                preselectedPatientId={patientData?.id}
                preselectedPrescriptionId={prescriptionId}
                onSubmit={() => {
                  handleDialogOpenChange(false);
                  queryClient.invalidateQueries({ queryKey: ['bills', patientId] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4" data-testid="metric-pending-bills">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{pendingBills}</p>
                  <p className="text-sm text-muted-foreground">Pending Bills</p>
                </div>
              </Card>
              <Card className="p-4" data-testid="metric-paid-bills">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{paidBills}</p>
                  <p className="text-sm text-muted-foreground">Paid Bills</p>
                </div>
              </Card>
              <Card className="p-4" data-testid="metric-total-paid">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">₹{(totalPaid / 100).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                </div>
              </Card>
            </div>
            <div className="space-y-3">
              {bills.map((bill: Bill) => (
                <div 
                  key={bill.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors" 
                  data-testid={`row-bill-${bill.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          bill.status === 'paid' ? 'default' : 
                          bill.status === 'overdue' ? 'destructive' : 'secondary'
                        }>
                          {bill.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <p className="font-medium mb-1">₹{(bill.amount / 100).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{bill.description}</p>
                      {bill.paymentMethod && (
                        <p className="text-sm text-blue-600 mt-1">
                          Payment: {bill.paymentMethod}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewingBill(bill)}
                        data-testid={`button-view-bill-${bill.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingBill(bill)}
                        data-testid={`button-edit-bill-${bill.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {bill.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatusMutation.mutate({ id: Number(bill.id), status: 'paid' })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-paid-${bill.id}`}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {bill.status === 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatusMutation.mutate({ id: Number(bill.id), status: 'pending' })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-pending-${bill.id}`}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        data-testid={`button-download-bill-${bill.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bills generated yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowAddDialog(true)}
              data-testid="button-add-first-bill"
            >
              Generate First Bill
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {editingBill && (
        <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bill</DialogTitle>
            </DialogHeader>
            <BillingForm 
              preselectedPatientId={patientData?.id}
              isEditing={true}
              onSubmit={() => {
                setEditingBill(null);
                queryClient.invalidateQueries({ queryKey: ['bills', patientId] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {viewingBill && (
        <ViewBillDialog
          bill={viewingBill}
          open={!!viewingBill}
          onOpenChange={(open) => !open && setViewingBill(null)}
        />
      )}
    </Card>
  );
}
