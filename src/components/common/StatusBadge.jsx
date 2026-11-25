import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ================= STATUS BADGE =================
//
// One lookup replacing the five getXStatusColor switches. The CRM's Badge
// has no success/warning variants, so those render as `variant="secondary"`
// with the tint applied via the --success/--warning tokens.

const STATUS_VARIANTS = {
  // success
  ACTIVE: "success",
  PAID: "success",
  ONGOING: "success",
  OPEN: "success",
  // default
  COMPLETED: "default",
  CLOSED: "default",
  // warning
  PARTIAL: "warning",
  ON_HOLD: "warning",
  UPCOMING: "warning",
  // destructive
  DROPPED: "destructive",
  PENDING: "destructive",
  INACTIVE: "destructive",
  // secondary (unknown)
};

const TINT_CLASSES = {
  success: "bg-success/15 text-success dark:bg-success/20",
  warning: "bg-warning/15 text-warning dark:bg-warning/20",
};

// `tone` overrides the lookup, for statuses whose colour depends on the page,
// such as a website enquiry's NEW, which the CRM's own enquiries share.
// `label` is shown in place of the status itself, such as "Follow Up" for
// FOLLOW_UP.
function StatusBadge({ status, tone, label, className }) {
  const variant = tone || STATUS_VARIANTS[status] || "secondary";
  const tint = TINT_CLASSES[variant];

  return (
    <Badge variant={tint ? "secondary" : variant} className={cn(tint, className)}>
      {label || status}
    </Badge>
  );
}

export default StatusBadge;