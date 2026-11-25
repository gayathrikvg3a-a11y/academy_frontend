import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableCard from "./common/TableCard";

function PaymentTable({
  payments,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>
      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Receipt</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-5 text-center text-muted-foreground"
              >
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>

                <TableCell className="font-medium">
                  {payment.receipt_number}
                </TableCell>

                <TableCell>
                  {payment.student_name}
                </TableCell>

                <TableCell className="text-right">
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </TableCell>

                <TableCell>
                  {payment.payment_method_name}
                </TableCell>

                <TableCell>
                  {payment.payment_date}
                </TableCell>

                <TableCell className="text-center">

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Receipt"
                    onClick={() => onView(payment)}
                  >
                    <Eye />
                  </Button>

                  {/* Edit and Delete were disabled before this change and are
                      left that way. The handlers behind them (Payments.jsx
                      handleDeletePayment) are wired to the confirm dialog and
                      will work as soon as these are re-enabled. */}

                </TableCell>

              </TableRow>
            ))
          )}

        </TableBody>

      </Table>
    </TableCard>
  );
}

export default PaymentTable;
