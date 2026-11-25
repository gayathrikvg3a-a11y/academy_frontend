import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";

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

import TableCard from "./common/TableCard";

function BannerTable({
  banners,
  onEdit,
  onDelete,
}) {
  return (
    <TableCard>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="py-5 text-center text-muted-foreground">
                No banners found.
              </TableCell>
            </TableRow>
          ) : (
            banners.map((banner) => {
              const image = resolveMediaUrl(
                banner.image_url,
                banner.image
              );

              return (
                <TableRow key={banner.id}>

                  {/* The row only has room for a strip of the banner, so the
                      image opens at full size in a tab of its own. */}
                  <TableCell className="w-40">
                    {image ? (
                      <a
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${banner.title} image`}
                      >
                        <img
                          src={image}
                          alt={banner.title}
                          className="aspect-video w-32 rounded-md bg-muted object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex aspect-video w-32 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {banner.title}
                  </TableCell>

                  <TableCell className="text-center">

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit"
                      onClick={() => onEdit(banner)}
                    >
                      <Pencil />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() => onDelete(banner)}
                    >
                      <Trash2 />
                    </Button>

                  </TableCell>

                </TableRow>
              );
            })
          )}

        </TableBody>

      </Table>

    </TableCard>
  );
}

export default BannerTable;
