import { useEffect, useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import AssignStudentDialog from "./AssignStudentDialog";

import ConfirmDialog from "./common/ConfirmDialog";
import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";
import useConfirm from "./common/useConfirm";
import useSnackbar from "./common/useSnackbar";

function BatchStudents({ batch }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(() => {
    if (batch?.id) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `batches/${batch.id}/students/`
      );

      setStudents(res.data);
    } catch (err) {
      console.error(err);

      showSnackbar(
        "Failed to load batch students.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (student) => {
    askConfirm({
      title: "Remove Student",
      message: `Remove ${student.student_name} from this batch?`,
      confirmText: "Yes",
      onConfirm: () => confirmRemove(student),
    });
  };

  const confirmRemove = async (student) => {
    try {
      await api.post(
        `batches/${batch.id}/remove_student/`,
        {
          student_id: student.id,
        }
      );

      await loadStudents();

      showSnackbar(
        "Student removed from batch."
      );
    } catch (err) {
      console.error(err);

      showSnackbar(
        "Failed to remove student.",
        "error"
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold">Assigned Students</h2>

          {!loading && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {batch?.capacity
                ? `${students.length} of ${batch.capacity} seats filled`
                : `${students.length} assigned`}
            </p>
          )}
        </div>

        <Button onClick={() => setOpenDialog(true)} className="shrink-0">
          <UserPlus data-icon="inline-start" />
          Assign Student
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-5">
          <Spinner />
        </div>
      ) : (
        <TableCard>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <p className="font-medium">No students assigned yet</p>
                    <p className="mb-3 mt-0.5 text-sm text-muted-foreground">
                      Students you assign to this batch will appear here.
                    </p>
                    <Button variant="outline" onClick={() => setOpenDialog(true)}>
                      <UserPlus data-icon="inline-start" />
                      Assign Student
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>

                    <TableCell>
                      {student.student_id}
                    </TableCell>

                    <TableCell>
                      {student.student_name}
                    </TableCell>

                    <TableCell>
                      {student.course_name}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={student.status} />
                    </TableCell>

                    <TableCell className="text-center">

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove"
                        onClick={() => handleRemove(student)}
                      >
                        <Trash2 />
                      </Button>

                    </TableCell>

                  </TableRow>
                ))
              )}

            </TableBody>

          </Table>
        </TableCard>
      )}

      <AssignStudentDialog
        open={openDialog}
        batch={batch}
        onClose={(refresh = false) => {
          setOpenDialog(false);

          if (refresh) {
            loadStudents();

            showSnackbar(
              "Student assigned to batch."
            );
          }
        }}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default BatchStudents;
