import { Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

import {
  DOMAIN_LABELS,
  formatJoiningDate,
  ROLE_LABELS,
  usernameOf,
} from "../utils/staff";

const COLUMNS = 7;

// Placeholder rows while the list loads, shaped like the real ones so the
// table doesn't jump when they arrive.
function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell />
    </TableRow>
  ));
}

export default function StaffTable({
  rows = [],
  loading = false,
  filtered = false,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>

      <Table className="min-w-[900px]">

        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Joined</TableHead>
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
                  {filtered ? "No staff match these filters" : "No staff yet"}
                </p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  {filtered
                    ? "Try a different search, or clear the filters."
                    : "Add your first staff member to give them a login."}
                </p>
              </TableCell>
            </TableRow>

          ) : (

            rows.map((staff) => (
              <TableRow key={staff.id}>

                {/* ================= STAFF ================= */}

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {initials(staff.staff_name || "?")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {staff.staff_name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {staff.email || "-"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {usernameOf(staff) || "-"}
                </TableCell>

                <TableCell className="text-sm tabular-nums">
                  {staff.phone || "-"}
                </TableCell>

                {/* Admins can do everything, so they're the one role that
                    stands out. */}
                <TableCell>
                  <Badge variant={staff.role === "ADMIN" ? "default" : "outline"}>
                    {ROLE_LABELS[staff.role] || staff.role || "-"}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm">
                  {DOMAIN_LABELS[staff.domain] || staff.domain || "-"}
                </TableCell>

                <TableCell className="text-sm">
                  {formatJoiningDate(staff.joining_date)}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${staff.staff_name}`}
                    onClick={() => onEdit(staff)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${staff.staff_name}`}
                    onClick={() => onDelete(staff)}
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
