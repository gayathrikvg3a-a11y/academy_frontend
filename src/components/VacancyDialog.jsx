import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import StatusBadge from "./common/StatusBadge";

import {
  formatCloseDate,
  getVacancyStatus,
  JOB_TYPE_LABELS,
} from "../utils/vacancies";

// ================= VACANCY DIALOG =================
//
// The long-form fields — description, responsibilities, requirements — can't
// live in a table row, so the table's row action opens them here. Everything
// comes from the row already loaded, so there is no extra request; the footer
// hands the same record straight to the edit form.

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value || "-"}</p>
    </div>
  );
}

function Prose({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line">{value || "-"}</p>
    </div>
  );
}

export default function VacancyDialog({
  open,
  onClose,
  vacancy,
  onEdit,
}) {
  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">

        <DialogHeader>
          <DialogTitle>{vacancy.title}</DialogTitle>
          <DialogDescription>
            {[vacancy.department, vacancy.location]
              .filter(Boolean)
              .join(" · ") || "Vacancy details"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={getVacancyStatus(vacancy)} />

            <Badge variant="outline">
              {JOB_TYPE_LABELS[vacancy.job_type] || vacancy.job_type || "-"}
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Experience" value={vacancy.experience} />
            <Detail label="Openings" value={vacancy.vacancies} />
            <Detail label="Salary" value={vacancy.salary} />
            <Detail
              label="Close Date"
              value={formatCloseDate(vacancy.close_date)}
            />
          </div>

          <Separator />

          <Prose label="Description" value={vacancy.description} />

          <Separator />

          <Prose label="Responsibilities" value={vacancy.responsibilities} />

          <Separator />

          <Prose label="Requirements" value={vacancy.requirements} />

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <Button onClick={() => onEdit(vacancy)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
