import { useCallback } from "react";
import { toast } from "sonner";

// ================= SNACKBAR STATE =================
//
// Every page that saves or deletes needs the same toast trigger. Lifted here
// so it isn't re-declared in a dozen files. Reimplemented over sonner, which
// renders through the <Toaster/> mounted in App.jsx.
//
//   const { showSnackbar } = useSnackbar();
//
//   showSnackbar("Student deleted successfully.");
//   showSnackbar("Failed to delete student.", "error");

function useSnackbar() {
  const showSnackbar = useCallback((message, severity = "success") => {
    if (severity === "error") {
      toast.error(message);
    } else if (severity === "warning") {
      toast.warning(message);
    } else {
      toast.success(message);
    }
  }, []);

  return { showSnackbar };
}

export default useSnackbar;
