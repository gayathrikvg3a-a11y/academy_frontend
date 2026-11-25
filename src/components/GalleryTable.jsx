import { Eye, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { resolveMediaUrl } from "../utils/mediaUrl";

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

function GalleryTable({
  albums,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Cover</TableHead>

            <TableHead>Album</TableHead>

            <TableHead className="text-center">Total Items</TableHead>

            <TableHead className="text-center">Status</TableHead>

            <TableHead className="text-center">Order</TableHead>

            <TableHead className="text-center">Actions</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {albums.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-5 text-center text-muted-foreground">
                No albums found.
              </TableCell>
            </TableRow>
          ) : (
            albums.map((album) => (
              <TableRow key={album.id}>

                <TableCell>
                  <Avatar className="size-15 rounded-lg after:rounded-lg">
                    <AvatarImage
                      src={resolveMediaUrl(album.cover_image_url, album.cover_image)}
                      alt={album.title}
                      className="rounded-lg"
                    />
                    <AvatarFallback className="rounded-lg">{album.title?.[0] ?? "A"}</AvatarFallback>
                  </Avatar>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{album.title}</p>
                  <p className="text-sm text-muted-foreground">{album.description}</p>
                </TableCell>

                <TableCell className="text-center">
                  {album.total_items}
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge status={album.is_active ? "ACTIVE" : "INACTIVE"} />
                </TableCell>

                <TableCell className="text-center">
                  {album.display_order}
                </TableCell>

                <TableCell className="text-center">

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="View"
                    onClick={() => onView(album)}
                  >
                    <Eye />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit"
                    onClick={() => onEdit(album)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => onDelete(album)}
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

export default GalleryTable;
