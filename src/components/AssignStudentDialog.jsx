import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

import api from "../api/axios";

import FormSelect from "./common/FormSelect";
import LoadingButton from "./common/LoadingButton";

import {
  FORM_ERROR_KEY,
  normalizeApiErrors,
} from "../utils/formErrors";

function AssignStudentDialog({
  open,
  batch,
  onClose,
}) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      loadStudents();
    } else {
      setStudentId("");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `batches/${batch.id}/available_students/`
      );

      setStudents(
        Array.isArray(res.data)
          ? res.data
          : res.data.results || []
      );
    } catch (err) {
      console.error("Student Load Error:", err);

      setStudents([]);

      setError(
        "Failed to load available students."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post(
        `batches/${batch.id}/assign_student/`,
        {
          student_id: studentId,
        }
      );

      onClose(true);
    } catch (err) {
      console.error(err);

      const apiErrors = normalizeApiErrors(
        err,
        "Failed to assign student."
      );

      setError(
        apiErrors[FORM_ERROR_KEY] ||
          apiErrors.student_id ||
          "Failed to assign student."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;

    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Student</DialogTitle>
          <DialogDescription>{batch?.batch_name}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : students.length === 0 ? (
          <Alert>
            <AlertDescription>No available students found.</AlertDescription>
          </Alert>
        ) : (
          <FormSelect
            required
            name="student_id"
            label="Student"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setError("");
            }}
            placeholder="Select Student"
            options={students.map((student) => ({
              value: student.id,
              label:
                `${student.student_id || student.admission_number || student.id} - ` +
                (student.student_name || student.full_name || student.name || "Unknown Student"),
            }))}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </Button>
          <LoadingButton
            loading={saving}
            onClick={handleAssign}
            disabled={loading || !studentId}
          >
            Assign
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignStudentDialog;
