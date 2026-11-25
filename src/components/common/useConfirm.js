import { useCallback, useState } from "react";

// ================= CONFIRM STATE =================
//
// Drives ConfirmDialog. Replaces window.confirm at every call site:
//
//   const { confirm, askConfirm, closeConfirm, runConfirm } = useConfirm();
//
//   askConfirm({
//     title: "Delete Student",
//     message: `Delete "${student.student_name}"?`,
//     onConfirm: () => deleteStudent(student),
//   });
//
//   <ConfirmDialog
//     {...confirm}
//     onConfirm={runConfirm}
//     onClose={closeConfirm}
//   />
//
// `runConfirm` awaits the action and keeps the dialog in its loading state
// until it settles, so a slow delete can't be fired twice.

const initialState = {
  open: false,
  title: "Confirm",
  message: "Are you sure?",
  confirmText: "Yes",
  cancelText: "No",
  confirmColor: "error",
  loading: false,
};

function useConfirm() {
  const [confirm, setConfirm] =
    useState(initialState);

  const [action, setAction] = useState(null);

  const askConfirm = useCallback(
    ({ onConfirm, ...options }) => {
      // Stored via an updater so a function value isn't mistaken for one.
      setAction(() => onConfirm);

      setConfirm({
        ...initialState,
        ...options,
        open: true,
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirm((previous) => {
      if (previous.loading) {
        return previous;
      }

      return {
        ...previous,
        open: false,
      };
    });
  }, []);

  const runConfirm = useCallback(async () => {
    if (!action) {
      return;
    }

    setConfirm((previous) => ({
      ...previous,
      loading: true,
    }));

    try {
      await action();
    } finally {
      setConfirm((previous) => ({
        ...previous,
        open: false,
        loading: false,
      }));
    }
  }, [action]);

  return {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  };
}

export default useConfirm;
