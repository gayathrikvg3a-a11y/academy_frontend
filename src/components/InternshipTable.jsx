import { Pencil, Trash2 } from "lucide-react";

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

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

export default function InternshipTable({
  rows = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <TableCard>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>ID</TableHead>

            <TableHead>Student</TableHead>

            <TableHead>College</TableHead>

            <TableHead>Internship</TableHead>

            <TableHead className="text-right">Fee</TableHead>

            <TableHead className="text-center">Certificate</TableHead>

            <TableHead className="text-center">Status</TableHead>

            <TableHead className="text-center">Actions</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {rows.length === 0 ? (

            <TableRow>

              <TableCell
                colSpan={8}
                className="py-5 text-center text-muted-foreground"
              >
                No internship students found.
              </TableCell>

            </TableRow>

          ) : (

            rows.map((student) => (

              <TableRow key={student.id}>

                <TableCell>
                  {student.internship_id}
                </TableCell>

                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>

                <TableCell>
                  {student.college || "-"}
                </TableCell>

                <TableCell>
                  {student.internship_title}
                </TableCell>

                <TableCell className="text-right">
                  ₹
                  {Number(student.fee || 0).toLocaleString("en-IN")}
                </TableCell>

                <TableCell className="text-center">

                  {student.certificate ? (

                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <a
                          href={student.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      Download
                    </Button>

                  ) : (

                    "-"

                  )}

                </TableCell>

                <TableCell className="text-center">

                  <StatusBadge status={student.status} />

                </TableCell>

                <TableCell className="text-center">

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                    onClick={() => onEdit(student)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => onDelete(student)}
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
  );
}
