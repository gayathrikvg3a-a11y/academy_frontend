import { Image as ImageIcon, Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDate } from "@/lib/utils";

import { resolveMediaUrl } from "../utils/mediaUrl";

import SeoMeter from "./common/SeoMeter";
import TableCard from "./common/TableCard";

// Each row's SEO meter fills a moment after the one above, up to this many
// rows, so a long list doesn't keep the last ones waiting.
const SEO_CASCADE_ROWS = 10;

function BlogTable({
  blogs,
  onEdit,
  onSeo,
  onDelete,
}) {
  return (
    <TableCard>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">SEO</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {blogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-5 text-center text-muted-foreground">
                No blogs found.
              </TableCell>
            </TableRow>
          ) : (
            blogs.map((blog, index) => {
              const image = resolveMediaUrl(
                blog.image_url,
                blog.image
              );

              return (
                <TableRow key={blog.id}>

                  {/* The row only has room for a thumbnail, so the image
                      opens at full size in a tab of its own. */}
                  <TableCell className="w-40">
                    {image ? (
                      <a
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${blog.title} image`}
                      >
                        <img
                          src={image}
                          alt={blog.title}
                          className="aspect-video w-32 rounded-md bg-muted object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex aspect-video w-32 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                  </TableCell>

                  {/* The short description is what readers see on the
                      website's blog cards, so it's shown under the title. */}
                  <TableCell className="max-w-md whitespace-normal">
                    <div className="font-medium">
                      {blog.title}
                    </div>

                    {blog.short_description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {blog.short_description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {formatDate(blog.blog_date)}
                  </TableCell>

                  <TableCell className="text-center">
                    <SeoMeter
                      item={blog}
                      delay={Math.min(index, SEO_CASCADE_ROWS) * 45}
                      onOpen={onSeo}
                    />
                  </TableCell>

                  <TableCell className="text-center">

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit"
                      onClick={() => onEdit(blog)}
                    >
                      <Pencil />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="SEO"
                      onClick={() => onSeo(blog)}
                    >
                      <Search />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() => onDelete(blog)}
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

export default BlogTable;
