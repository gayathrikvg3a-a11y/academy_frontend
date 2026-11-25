import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

// ================= FORM DIALOG =================
//
// The shell every add/edit form renders through, so dialog chrome — title
// block, rules, content padding, action bar — is declared once.
//
// `formError` is for problems that belong to the form as a whole (server
// non_field_errors, network failure, failed option loading). Field-level
// messages never come here; they belong under their own field.

const maxWidthClasses = {
  xs: "sm:max-w-md",
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
};

function FormDialog({
  open,
  onClose,
  title,
  subtitle,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  saving = false,
  loading = false,
  formError = "",
  maxWidth = "md",
  children,
}) {
  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`max-h-[85svh] overflow-y-auto ${maxWidthClasses[maxWidth] || maxWidthClasses.md}`}
      >
        {/* ================= TITLE ================= */}

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          {subtitle && (
            <DialogDescription>{subtitle}</DialogDescription>
          )}
        </DialogHeader>

        {/* ================= CONTENT ================= */}

        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          children
        )}

        {/* ================= ACTIONS ================= */}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={onSubmit}
            disabled={saving || loading}
          >
            {saving && <Spinner data-icon="inline-start" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
