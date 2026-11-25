import { Pencil, Trash2 } from "lucide-react";

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

import { formatDateTime } from "@/lib/utils";

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

const COLUMNS = 4;

// Placeholder rows while the list loads, shaped like the real ones so the
// table doesn't jump when they arrive.
function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell />
    </TableRow>
  ));
}

export default function AnnouncementTable({
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
            <TableHead>Announcement</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="text-center">Status</TableHead>
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
                  {filtered ? "No announcements match these filters" : "No announcements yet"}
                </p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  {filtered
                    ? "Try a different search or filter, or clear them."
                    : "Post your first announcement."}
                </p>
              </TableCell>
            </TableRow>

          ) : (

            rows.map((announcement) => (
              <TableRow key={announcement.id}>

                {/* Cut to two lines so one long announcement doesn't make its
                    row tower over the rest; the edit form shows it whole. */}
                <TableCell className="max-w-xl whitespace-normal align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {announcement.title}
                    </span>

                    {announcement.is_important && (
                      <StatusBadge
                        status="IMPORTANT"
                        tone="warning"
                        label="Important"
                      />
                    )}
                  </div>

                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {announcement.description || "-"}
                  </p>
                </TableCell>

                <TableCell className="whitespace-nowrap align-top text-sm">
                  {formatDateTime(announcement.published_at)}
                </TableCell>

                <TableCell className="text-center align-top">
                  <StatusBadge status={announcement.is_active ? "ACTIVE" : "INACTIVE"} />
                </TableCell>

                <TableCell className="text-center align-top">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit "${announcement.title}"`}
                    onClick={() => onEdit(announcement)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete "${announcement.title}"`}
                    onClick={() => onDelete(announcement)}
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
