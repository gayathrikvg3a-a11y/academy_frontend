import { CheckCircle2, Image as ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { resolveMediaUrl } from "../utils/mediaUrl";

import CourseFee from "./common/CourseFee";
import StatusBadge from "./common/StatusBadge";

function InfoRow({ label, value }) {
  return (
    <div className="mb-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function CourseOverview({ course }) {
  const thumbnail = resolveMediaUrl(
    course.thumbnail_url,
    course.thumbnail
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Basic Information */}
      <Card>
        <CardContent className="p-4">

          <h3 className="mb-3 text-base font-semibold">Basic Information</h3>

          <Separator className="mb-3" />

          <div className="flex flex-col gap-4 sm:flex-row">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={course.name}
                className="aspect-video w-full shrink-0 rounded-lg bg-muted object-cover sm:w-56"
              />
            ) : (
              <div className="flex aspect-video w-full shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-muted text-sm text-muted-foreground sm:w-56">
                <ImageIcon className="size-5" />
                No thumbnail
              </div>
            )}

            <div className="grid flex-1 content-start gap-3 sm:grid-cols-2">
              <InfoRow label="Course Name" value={course.name} />
              <InfoRow label="Course Code" value={course.course_code} />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Course Details */}
      <Card>
        <CardContent className="p-4">

          <h3 className="mb-3 text-base font-semibold">Course Details</h3>

          <Separator className="mb-3" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoRow label="Duration" value={`${course.duration} ${course.duration_type}`} />
            <InfoRow
              label="Course Fee"
              value={
                <CourseFee
                  fee={course.course_fee}
                  discount={course.discount_fee}
                />
              }
            />
            <InfoRow
              label="Certificate"
              value={course.certificate_available ? "Available" : "Not Available"}
            />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={course.is_active ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="p-4">

          <h3 className="mb-3 text-base font-semibold">Description</h3>

          <Separator className="mb-3" />

          <p>{course.details || "No description available."}</p>

        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      <Card>
        <CardContent className="p-4">

          <h3 className="mb-3 text-base font-semibold">Learning Outcomes</h3>

          <Separator className="mb-3" />

          {course.learning_outcomes?.length ? (
            <ul className="flex flex-col gap-1.5">
              {course.learning_outcomes.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No learning outcomes added.</p>
          )}

        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardContent className="p-4">

          <h3 className="mb-3 text-base font-semibold">Prerequisites</h3>

          <Separator className="mb-3" />

          {course.prerequisites?.length ? (
            <ul className="flex flex-col gap-1.5">
              {course.prerequisites.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No prerequisites added.</p>
          )}

        </CardContent>
      </Card>

    </div>
  );
}

export default CourseOverview;
