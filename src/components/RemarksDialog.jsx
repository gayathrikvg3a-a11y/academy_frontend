import { useEffect, useState } from "react";

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
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import LoadingButton from "./common/LoadingButton";

import { updateLessonProgress } from "../api/progressApi";

// ================= REMARKS DIALOG =================
//
// Shown when marking a lesson as completed. Collects an optional remark from
// the teacher, then posts the completion to the student's checklist.

function RemarksDialog({
  open,
  studentId,
  lesson,
  onClose,
  onSuccess,
}) {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset the field every time a (possibly different) lesson is opened.
  useEffect(() => {
    if (open) {
      setRemarks("");
      setError("");
    }
  }, [open, lesson]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");

      await updateLessonProgress(studentId, {
        lesson_id: lesson.lesson_id,
        is_completed: true,
        remarks,
      });

      onSuccess();
    } catch (err) {
      console.error(
        "Failed to mark lesson completed:",
        err.response?.data || err
      );

      setError(
        "Failed to mark lesson completed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (saving) return;
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Completed</DialogTitle>

          <DialogDescription>
            {lesson?.lesson_title}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel>Remarks</FieldLabel>

          <Textarea
            name="remarks"
            rows={3}
            placeholder="Completed in classroom session"
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value);
              setError("");
            }}
          />
        </Field>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <LoadingButton
            loading={saving}
            onClick={handleSubmit}
          >
            Confirm
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RemarksDialog;
