import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableCard from "./common/TableCard";

function BatchTable({
  batches = [],
  onView,
  onEdit,
  onDelete,
}) {
  const [selectedBatch, setSelectedBatch] = useState(null);

  return (
    <>
      <TableCard>
        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead className="text-center">Session</TableHead>
              <TableHead className="text-center">Capacity</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-5 text-center text-muted-foreground">
                  No batches found.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => onView(batch)}
                    >
                      {batch.batch_name}
                    </button>
                  </TableCell>

                  <TableCell>{batch.course_name}</TableCell>

                  <TableCell>{batch.trainer}</TableCell>

                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {batch.session === "MORNING" ? "Morning" : "Evening"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {batch.capacity}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={batch.is_active ? "bg-success/15 text-success dark:bg-success/20" : "bg-destructive/10 text-destructive dark:bg-destructive/20"}
                    >
                      {batch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        onClick={() => setSelectedBatch(batch)}
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(selectedBatch);
                          }}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            onDelete(selectedBatch);
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}

          </TableBody>

        </Table>
      </TableCard>
    </>
  );
}

export default BatchTable;
