import { useEffect, useState } from "react";
import { format } from "date-fns";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import api from "../api/axios";

import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import LoadingButton from "./common/LoadingButton";
import TableCard from "./common/TableCard";

import {
  clearFieldError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
} from "../utils/formErrors";

function StudentPayments({
  open,
  onClose,
  student,
  onPaymentSaved,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payments, setPayments] = useState([]);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Field-level messages for the Add Payment form, keyed by field name.
  const [errors, setErrors] = useState({});

  const courseFee = Number(student?.course_fee || 0);

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const balance = courseFee - totalPaid;

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get(
        "payment-methods/",
        {
          params: {
            data: "alllist",
          },
        }
      );

      setPaymentMethods(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch payment methods:",
        error
      );
    }
  };

  const fetchPayments = async () => {
    if (!student) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("payments/");

      const paymentData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const studentPayments = paymentData.filter(
        (payment) =>
          Number(payment.student) === Number(student.id)
      );

      setPayments(studentPayments);
    } catch (error) {
      console.error(
        "Failed to fetch payments:",
        error
      );

      setError("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && student) {
      setError("");
      setSuccess("");
      setAmount("");
      setPaymentMethod("");

      // Local date, not toISOString's UTC one, which is yesterday before
      // 5:30 AM IST.
      setPaymentDate(
        format(new Date(), "yyyy-MM-dd")
      );

      fetchPaymentMethods();
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  // ================= VALIDATION =================
  //
  // Every check reports under the field it belongs to, and all checks run so
  // the user sees everything wrong at once rather than one message at a time.

  const validate = () => {
    const newErrors = {};

    if (!amount) {
      newErrors.amount = "Payment amount is required.";
    } else if (Number(amount) <= 0) {
      newErrors.amount =
        "Payment amount must be greater than zero.";
    } else if (Number(amount) > balance) {
      newErrors.amount = `Payment exceeds the current balance of ₹${balance.toLocaleString(
        "en-IN"
      )}.`;
    }

    if (!paymentMethod) {
      newErrors.payment_method =
        "Payment method is required.";
    }

    if (!paymentDate) {
      newErrors.payment_date =
        "Payment date is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSavePayment = async () => {
    setError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const paymentData = {
        student: student.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_date: paymentDate,
      };

      await api.post(
        "payments/",
        paymentData
      );

      setSuccess(
        "Payment added successfully."
      );

      setAmount("");
      setPaymentMethod("");
      setErrors({});

      await fetchPayments();

      if (onPaymentSaved) {
        await onPaymentSaved();
      }
    } catch (saveError) {
      console.error(
        "Failed to save payment:",
        saveError
      );

      // Server-side validation lands under the offending field; anything
      // form-wide falls back to the alert at the top of the dialog.
      const apiErrors = normalizeApiErrors(
        saveError,
        "Failed to save payment."
      );

      const { [FORM_ERROR_KEY]: formError, ...fieldErrors } =
        apiErrors;

      setErrors(fieldErrors);

      if (formError) {
        setError(formError);
      }
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const handleViewReceipt = async (payment) => {
    try {
      setError("");

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

      const pdfUrl =
        window.URL.createObjectURL(pdfBlob);

      window.open(
        pdfUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } catch (error) {
      console.error(
        "Failed to open payment receipt:",
        error.response?.data || error
      );

      setError(
        "Failed to open payment receipt."
      );
    }
  };

  if (!student) {
    return null;
  }

  const summaryCards = [
    { label: "Course Fee", value: `₹${formatMoney(courseFee)}` },
    { label: "Total Paid", value: `₹${formatMoney(totalPaid)}` },
    { label: "Balance", value: `₹${formatMoney(balance)}` },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Student Payments</DialogTitle>
          <DialogDescription>
            {student.student_name} — {student.student_id}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* PAYMENT SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <Card key={card.label} className="h-full">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ADD PAYMENT */}

        <div className="flex flex-col gap-4">
          <h3 className="text-base font-semibold">Add Payment</h3>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              required
               type="number"
              name="amount"
              label="Payment Amount"
              placeholder="50000"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);

                setErrors((previous) =>
                  clearFieldError(previous, "amount")
                );
              }}
              disabled={balance <= 0}
              error={errors.amount || ""}
            />

            <FormSelect
              required
              name="payment_method"
              label="Payment Method"
              value={paymentMethod}
              onChange={(event) => {
                setPaymentMethod(
                  event.target.value
                );

                setErrors((previous) =>
                  clearFieldError(
                    previous,
                    "payment_method"
                  )
                );
              }}
              disabled={balance <= 0}
              error={errors.payment_method || ""}
              placeholder="Select Payment Method"
              options={[
                { value: "", label: "Select Payment Method" },
                ...paymentMethods.map((method) => ({
                  value: method.id,
                  label: method.name,
                })),
              ]}
            />

            <FormField
              required
              type="date"
              name="payment_date"
              label="Payment Date"
              value={paymentDate}
              onChange={(event) => {
                setPaymentDate(
                  event.target.value
                );

                setErrors((previous) =>
                  clearFieldError(
                    previous,
                    "payment_date"
                  )
                );
              }}
              disabled={balance <= 0}
              error={errors.payment_date || ""}
            />
          </div>

          <div className="flex justify-end">
            <LoadingButton
              loading={saving}
              onClick={handleSavePayment}
              disabled={balance <= 0}
            >
              {balance <= 0
                ? "Payment Completed"
                : "Add Payment"}
            </LoadingButton>
          </div>
        </div>

        {/* PAYMENT HISTORY */}

        <div className="flex flex-col gap-4">
          <h3 className="text-base font-semibold">Payment History</h3>

          {loading ? (
            <div className="flex justify-center py-5">
              <Spinner />
            </div>
          ) : (
            <TableCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-5 text-center text-muted-foreground">
                        No payments recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.receipt_number}</TableCell>
                        <TableCell>{payment.payment_date}</TableCell>
                        <TableCell>{payment.payment_method_name}</TableCell>
                        <TableCell className="text-right">₹{formatMoney(payment.amount)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StudentPayments;
