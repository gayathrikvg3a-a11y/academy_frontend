import { Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableCard from "./common/TableCard";

import { initials } from "@/lib/utils";

const COLUMNS = 3;

// Placeholder rows while the list loads, shaped like the real ones so the
// table doesn't jump when they arrive.
function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
        </div>
      </TableCell>
      <TableCell />
    </TableRow>
  ));
}

export default function TestimonialTable({
  rows = [],
  loading = false,
  filtered = false,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>

      <Table className="min-w-[720px]">

        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Testimonial</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {loading ? (
            <LoadingRows />
          ) : rows.length === 0 ? (

            <TableRow>
              <TableCell colSpan={COLUMNS} className="py-8 text-center">
                <p className="font-medium text-muted-foreground">
                  {filtered ? "No testimonials match this search" : "No testimonials yet"}
                </p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  {filtered
                    ? "Try a different search, or clear it."
                    : "Add what a student said about their course."}
                </p>
              </TableCell>
            </TableRow>

          ) : (

            rows.map((testimonial) => (
              <TableRow key={testimonial.id}>

                {/* ================= STUDENT ================= */}

                <TableCell className="align-top">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {initials(testimonial.name || "?")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {testimonial.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {testimonial.domain || "-"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Cut to three lines so one long testimonial doesn't make its
                    row tower over the rest; the edit form shows it whole. */}
                <TableCell className="max-w-xl whitespace-normal align-top text-muted-foreground">
                  <p className="line-clamp-3">
                    {testimonial.note || "-"}
                  </p>
                </TableCell>

                <TableCell className="text-center align-top">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${testimonial.name}'s testimonial`}
                    onClick={() => onEdit(testimonial)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${testimonial.name}'s testimonial`}
                    onClick={() => onDelete(testimonial)}
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
