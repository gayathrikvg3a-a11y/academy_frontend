import { FileText, Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import api from "../api/axios";

function ReceiptField({ label, value, className }) {
  return (
    <div className={className}>
      <p className="font-medium">{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}

function PaymentReceiptDialog({
  open,
  onClose,
  payment,
}) {
  const handleOpenReceipt = async () => {
    if (!payment) return;

    try {
      const response = await api.get(
        `payments/${payment.id}/payment-slip/`,
        {
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Failed to open receipt:", error);
    }
  };

  if (!payment) {
    return null;
  }

  const balance = Number(payment.balance || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogDescription>{payment.receipt_number}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-4 ring-1 ring-foreground/10">
          <p className="text-center text-xl font-bold">CIGNES ACADEMY</p>
          <p className="mb-3 text-center text-sm text-muted-foreground">Payment Receipt</p>
          <Separator className="mb-3" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <ReceiptField label="Receipt Number" value={payment.receipt_number} />
            <ReceiptField label="Payment Date" value={payment.payment_date} />
            <ReceiptField label="Student ID" value={payment.student_id} />
            <ReceiptField label="Student Name" value={payment.student_name} />
            <ReceiptField label="Payment Method" value={payment.payment_method_name} />
            <ReceiptField
              label="Amount"
              value={`₹${Number(payment.amount).toLocaleString("en-IN")}`}
              className="font-bold text-success"
            />
            <ReceiptField label="Course Fee" value={`₹${Number(payment.course_fee || 0).toLocaleString("en-IN")}`} />
            <ReceiptField label="Total Paid" value={`₹${Number(payment.total_paid || 0).toLocaleString("en-IN")}`} className="font-semibold text-primary" />
            <ReceiptField
              label="Balance"
              value={`₹${balance.toLocaleString("en-IN")}`}
              className={`font-bold ${balance > 0 ? "text-destructive" : "text-success"}`}
            />
            <ReceiptField label="Collected By" value={payment.collection_staff_name} />
            <ReceiptField label="Transaction Reference" value={payment.transaction_reference} className="col-span-2" />
            <ReceiptField label="Notes" value={payment.notes} className="col-span-2" />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleOpenReceipt}>
            <FileText data-icon="inline-start" />
            Open PDF
          </Button>
          <Button variant="outline" onClick={handleOpenReceipt}>
            <Printer data-icon="inline-start" />
            Print
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X data-icon="inline-start" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentReceiptDialog;
