import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

import {
  formatCloseDate,
  getVacancyStatus,
  JOB_TYPE_LABELS,
} from "../utils/vacancies";

export default function VacancyTable({
  rows = [],
  loading = false,
  onView,
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

      <Table className="min-w-[980px]">

        <TableHeader>

          <TableRow>

            <TableHead>Role</TableHead>

            <TableHead>Location</TableHead>

            <TableHead>Job Type</TableHead>

            <TableHead>Experience</TableHead>

            <TableHead className="text-center">Openings</TableHead>

            <TableHead>Salary</TableHead>

            <TableHead>Closes</TableHead>

            <TableHead className="text-center">Status</TableHead>

            <TableHead className="text-center">Actions</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {rows.length === 0 ? (

            <TableRow>

              <TableCell
                colSpan={9}
                className="py-8 text-center"
              >
                <p className="font-medium text-muted-foreground">
                  No vacancies found
                </p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Post your first job opening.
                </p>
              </TableCell>

            </TableRow>

          ) : (

            rows.map((vacancy) => (

              <TableRow key={vacancy.id}>

                {/* ================= ROLE ================= */}

                <TableCell>
                  <p className="font-medium text-foreground">
                    {vacancy.title}
                  </p>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {vacancy.department || "-"}
                  </p>
                </TableCell>

                <TableCell className="text-sm">
                  {vacancy.location || "-"}
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {JOB_TYPE_LABELS[vacancy.job_type] || vacancy.job_type || "-"}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm">
                  {vacancy.experience || "-"}
                </TableCell>

                <TableCell className="text-center">
                  {vacancy.vacancies ?? "-"}
                </TableCell>

                <TableCell className="text-sm">
                  {vacancy.salary || "-"}
                </TableCell>

                <TableCell className="text-sm">
                  {formatCloseDate(vacancy.close_date)}
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge status={getVacancyStatus(vacancy)} />
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="View"
                    onClick={() => onView(vacancy)}
                  >
                    <Eye />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                    onClick={() => onEdit(vacancy)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => onDelete(vacancy)}
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
