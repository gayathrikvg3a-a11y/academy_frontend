import { useState } from "react";
import { MoreVertical, Eye, Pencil, Search, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { resolveMediaUrl } from "../utils/mediaUrl";

import CourseFee from "./common/CourseFee";
import SeoMeter from "./common/SeoMeter";
import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

// Each row's SEO meter fills a moment after the one above, up to this many
// rows, so a long list doesn't keep the last ones waiting.
const SEO_CASCADE_ROWS = 10;

function CourseTable({ courses = [], onView, onEdit, onSeo, onDelete }) {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <>
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">SEO</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-5 text-center text-muted-foreground">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course, index) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-lg after:rounded-lg">
                        <AvatarImage
                          src={resolveMediaUrl(course.thumbnail_url, course.thumbnail)}
                          alt={course.name}
                          className="rounded-lg object-cover"
                        />
                        <AvatarFallback className="rounded-lg">{course.name?.[0] ?? "C"}</AvatarFallback>
                      </Avatar>

                      <span className="font-medium">{course.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>{course.course_code}</TableCell>

                  <TableCell>{course.category_name}</TableCell>

                  <TableCell className="text-center">
                    {course.duration} {course.duration_type}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <CourseFee
                      align="end"
                      fee={course.course_fee}
                      discount={course.discount_fee}
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge status={course.is_active ? "ACTIVE" : "INACTIVE"} />
                  </TableCell>

                  <TableCell className="text-center">
                    <SeoMeter
                      item={course}
                      delay={Math.min(index, SEO_CASCADE_ROWS) * 45}
                      onOpen={onSeo}
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onView(selectedCourse);
                          }}
                        >
                          <Eye /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(selectedCourse);
                          }}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onSeo(selectedCourse);
                          }}
                        >
                          <Search /> SEO
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            onDelete(selectedCourse);
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

export default CourseTable;
