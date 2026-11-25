import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

function CourseCategoryTable({
  categories,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Order</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-5 text-center text-muted-foreground">
                No course categories found.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>

                <TableCell className="font-medium">
                  {category.name}
                </TableCell>

                {/* Cut to two lines so one long description doesn't make its
                    row tower over the rest; the edit form shows it whole. */}
                <TableCell className="max-w-md whitespace-normal text-muted-foreground">
                  <p className="line-clamp-2">
                    {category.description || "-"}
                  </p>
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge status={category.is_active ? "ACTIVE" : "INACTIVE"} />
                </TableCell>

                <TableCell className="text-center">
                  {category.display_order ?? "-"}
                </TableCell>

                <TableCell className="text-center">

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => onDelete(category)}
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

export default CourseCategoryTable;
