// ================= COURSE FEE =================
//
// A course carries two prices: the list fee and, when a discount is set, the
// reduced one. Wherever both exist the list fee is struck through and the
// price the student actually pays is the prominent one, so the saving reads at
// a glance. Declared once here because courses show their fee in the table,
// the overview and the detail header.

const formatFee = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function CourseFee({
  fee,
  discount,
  align = "start",
  orientation = "vertical",
  className = "",
}) {
  const hasDiscount = Number(discount) > 0;

  if (!hasDiscount) {
    return <span className={className}>{formatFee(fee)}</span>;
  }

  const layout =
    orientation === "horizontal"
      ? "inline-flex items-center gap-1.5"
      : `flex flex-col leading-tight ${align === "end" ? "items-end" : "items-start"}`;

  return (
    <span className={`${layout} ${className}`}>
      <span className="text-xs text-muted-foreground line-through">
        {formatFee(fee)}
      </span>

      <span className="font-semibold">
        {formatFee(discount)}
      </span>
    </span>
  );
}

export default CourseFee;
