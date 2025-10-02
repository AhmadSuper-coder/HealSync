import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Bill } from "@shared/schema";

interface ViewBillDialogProps {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewBillDialog({ bill, open, onOpenChange }: ViewBillDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Amount</p>
              <p className="text-lg font-bold">₹{(bill.amount / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Status</p>
              <Badge variant={
                bill.status === 'paid' ? 'default' : 
                bill.status === 'overdue' ? 'destructive' : 'secondary'
              }>
                {bill.status}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Created</p>
              <p>{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
            {bill.paidAt && (
              <div>
                <p className="font-medium">Paid</p>
                <p>{bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'Not paid'}</p>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{bill.description}</p>
          </div>
          {bill.paymentMethod && (
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-sm">{bill.paymentMethod}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
