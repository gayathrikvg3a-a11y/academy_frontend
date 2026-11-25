import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// ================= LOADING BUTTON =================
//
// MUI-shaped props mapped internally onto the CRM Button. Keeps the label
// while loading (spins in place) — no "Loading..." text swap.

function LoadingButton({
  loading = false,
  children,
  disabled = false,
  startIcon,
  variant = "contained",
  color = "primary",
  fullWidth = false,
  size,
  onClick,
  type = "button",
  ...props
}) {
  let mappedVariant = "default";
  if (variant === "outlined") mappedVariant = "outline";
  else if (variant === "text" || color === "inherit") mappedVariant = "ghost";
  else if (color === "error") mappedVariant = "destructive";
  else if (variant === "contained" && color === "primary") mappedVariant = "default";

  return (
    <Button
      variant={mappedVariant}
      size={size}
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={fullWidth ? "w-full" : undefined}
      {...props}
    >
      {loading ? (
        <Spinner data-icon="inline-start" />
      ) : startIcon ? (
        <span data-icon="inline-start">{startIcon}</span>
      ) : null}
      {children}
    </Button>
  );
}

export default LoadingButton;
