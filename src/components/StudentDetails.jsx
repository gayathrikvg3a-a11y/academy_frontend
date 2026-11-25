import {
  Pencil,
  CreditCard,
  Phone,
  Mail,
  MessageCircle,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import StatusBadge from "./common/StatusBadge";
import { formatINR } from "@/lib/utils";

function StudentDetails({
  open,
  onClose,
  student,
  onEdit,
  onAddPayment,
}) {
  if (!student) {
    return null;
  }

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const balance = Number(student.balance || 0);
  const courseFee = Number(student.course_fee || 0);
  const paid = Number(student.total_paid || 0);
  const payPercent = courseFee > 0 ? Math.round((paid / courseFee) * 100) : 0;
  const isPaid = student.payment_status === "PAID";
  const hasBalance = balance > 0;

  // Real history when the payload carries it; otherwise the ledger stays
  // honest and points the operator at the full payments dialog.
  const recentPayments = Array.isArray(student.payments)
    ? [...student.payments]
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 5)
    : [];

  const overviewTabs = {
    overview: (
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Contact</SectionTitle>
          <ContactRow icon={<Phone />} value={student.phone} />
          <ContactRow icon={<MessageCircle />} value={student.whatsapp} />
          <ContactRow
            icon={<Mail />}
            value={student.email}
            href={student.email ? `mailto:${student.email}` : undefined}
          />
        </div>

        <div>
          <SectionTitle>Personal</SectionTitle>
          <DetailRow label="Gender" value={student.gender} />
          <DetailRow label="DOB" value={formatDate(student.date_of_birth)} />
          <DetailRow label="Recommended by" value={student.recommended_by} />
        </div>

        <div>
          <SectionTitle>Academic</SectionTitle>
          <DetailRow label="College" value={student.college} />
          <DetailRow label="Stream" value={student.academic_stream} />
        </div>

        <div>
          <SectionTitle>Address</SectionTitle>
          <DetailRow label="Address" value={student.address} />
          <DetailRow
            label="District"
            value={student.district}
          />
          <DetailRow
            label="State / PIN"
            value={[student.state, student.pincode].filter(Boolean).join(" - ") || "-"}
          />
        </div>
      </div>
    ),
    course: (
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Course</SectionTitle>
          <DetailRow label="Course" value={student.course_name} />
          <DetailRow label="Batch" value={student.batch_name} />
          <DetailRow label="Fee type" value={student.fee_type_name} />
        </div>

        <div>
          <SectionTitle>Enrollment</SectionTitle>
          <DetailRow label="Joining date" value={formatDate(student.joining_date)} />
          <DetailRow label="Status" value={student.status || "UNKNOWN"} />
        </div>
      </div>
    ),
    payments: (
      <div className="space-y-6">
        <PaymentLedger
          balance={balance}
          courseFee={courseFee}
          paid={paid}
          payPercent={payPercent}
          isPaid={isPaid}
          hasBalance={hasBalance}
          onAddPayment={() => onAddPayment?.(student)}
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <SectionTitle className="mb-0">Recent payments</SectionTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddPayment?.(student)}
              className="gap-1 px-1.5 text-primary hover:bg-transparent hover:text-primary"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {recentPayments.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border bg-card">
              {recentPayments.map((payment, index) => (
                <li
                  key={payment.id ?? index}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-md bg-muted">
                      <IndianRupee className="size-3.5 text-muted-foreground" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {payment.payment_method || "Payment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium tabular-nums text-success">
                    +{formatINR(payment.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                No payment history in this record yet.
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                Open the payments view to record the first one.
              </p>
            </div>
          )}
        </div>
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[88svh] overflow-y-auto p-0 sm:max-w-2xl">
        {/* HEADER */}
        <div className="border-b bg-muted/40 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <DialogHeader className="min-w-0">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-lg">
                  <AvatarImage
                    src={student.student_photo || ""}
                    alt={student.student_name}
                  />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-base font-bold text-primary">
                    {student.student_name?.charAt(0)?.toUpperCase() || "S"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg font-semibold">
                    {student.student_name}
                  </DialogTitle>
                  <DialogDescription className="truncate text-sm">
                    {student.student_id}
                  </DialogDescription>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status={student.status || "UNKNOWN"} />
                {student.payment_status && (
                  <StatusBadge status={student.payment_status} />
                )}
              </div>
            </DialogHeader>

            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(student)}
                aria-label="Edit student"
              >
                <Pencil data-icon="inline-start" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <Button
                size="sm"
                onClick={() => onAddPayment?.(student)}
                aria-label="Add payment"
              >
                <CreditCard data-icon="inline-start" />
                <span className="hidden sm:inline">Add Payment</span>
              </Button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-5 py-4">
          <Tabs defaultValue="overview">
            <TabsList variant="line" className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="overview">
                {overviewTabs.overview}
              </TabsContent>
              <TabsContent value="course">
                {overviewTabs.course}
              </TabsContent>
              <TabsContent value="payments">
                {overviewTabs.payments}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================= SUB-COMPONENTS =================

function SectionTitle({ children, className = "" }) {
  return (
    <h4
      className={`mb-2 text-xs font-bold tracking-wide uppercase text-muted-foreground ${className}`}
    >
      {children}
    </h4>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-2 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium break-words text-foreground">
        {value || "-"}
      </span>
    </div>
  );
}

function ContactRow({ icon, value, href }) {
  const content = (
    <>
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/70">
        {icon}
      </span>
      <span className="text-sm font-medium break-all text-foreground">
        {value || "-"}
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-2 py-1">
      {href ? (
        <a
          href={href}
          className="flex items-center gap-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function PaymentLedger({
  balance,
  courseFee,
  paid,
  payPercent,
  isPaid,
  hasBalance,
  onAddPayment,
}) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Balance is the decision, not a stat cluster */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Balance</p>
          <p
            className={`text-2xl font-semibold tabular-nums ${
              hasBalance ? "text-destructive" : "text-success"
            }`}
          >
            {formatINR(balance)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusBadge status={isPaid ? "PAID" : hasBalance ? "PARTIAL" : "PAID"} />
          {hasBalance && (
            <Button
              size="sm"
              onClick={() => onAddPayment?.()}
              className="gap-1"
            >
              <CreditCard data-icon="inline-start" />
              Record payment
            </Button>
          )}
        </div>
      </div>

      {/* Paid toward fee, with the actual story */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatINR(paid)} paid of {formatINR(courseFee)}</span>
          <span>{payPercent}%</span>
        </div>

        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={payPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Payment progress"
        >
          <div
            className={`h-full rounded-full ${
              hasBalance ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${Math.min(payPercent, 100)}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {isPaid
            ? "Fee paid in full."
            : `If paid across 12 installments, about ${formatINR(courseFee / 12)} per month.`}
        </p>
      </div>
    </div>
  );
}

export default StudentDetails;
