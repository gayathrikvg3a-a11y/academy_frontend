import { GraduationCap, Users, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ================= FORMATTING =================
//
// Same en-IN treatment the event table uses, so a date reads the same way
// wherever it appears.

const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return null;

  const time = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(time.getTime())) return value;

  return time.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// ================= SECTION HEADING =================
//
// The icon is a landmark, not the headline: it stays smaller and quieter than
// the text so the heading is what the eye lands on first.

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <Icon className="size-5 text-muted-foreground" />
      <h3 className="text-base font-semibold">{children}</h3>
    </div>
  );
}

// ================= FIELD =================
//
// Label above value, not label-left / value-right with a rule between every
// pair. Proximity does the grouping, so the dividers can go and the value gets
// to be the heavier of the two.

function Field({ label, value }) {
  // 0 is a real answer ("Available: 0"), so only null / undefined / "" fall
  // back to the em dash.
  const isBlank =
    value === null || value === undefined || value === "";

  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-sm text-muted-foreground">
        {label}
      </p>

      <p
        className={`font-semibold break-words ${isBlank ? "text-muted-foreground" : ""}`}
      >
        {isBlank ? "—" : value}
      </p>
    </div>
  );
}

// A pair of fields per row on anything wider than a phone.
function FieldGrid({ columns = 2, children }) {
  const colClass =
    columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 gap-x-3 gap-y-5 ${colClass}`}>
      {children}
    </div>
  );
}

function BatchOverview({ batch }) {
  if (!batch) return null;

  const enrolledStudents = batch.enrolled_students ?? 0;
  const capacity = batch.capacity || 0;
  const availableSeats = Math.max(capacity - enrolledStudents, 0);

  const enrolledRatio = capacity > 0
    ? Math.min(enrolledStudents / capacity, 1)
    : 0;

  const sessionLabel =
    batch.session === "MORNING"
      ? "Morning"
      : "Evening";

  return (
    <div className="grid gap-4 lg:grid-cols-12">

      {/* ================= DETAILS ================= */}
      {/*
        Batch name, code, course and status already sit in the page header, so
        this panel carries only what the header does not.
      */}

      <div className="lg:col-span-7">
        <Card className="h-full">
          <CardContent className="p-4">

            <SectionHeading icon={GraduationCap}>
              Batch Details
            </SectionHeading>

            <FieldGrid>
              <Field
                label="Trainer"
                value={batch.trainer}
              />

              <Field
                label="Session"
                value={sessionLabel}
              />
            </FieldGrid>

            {/* One rule between the two groups instead of one between
                every row: who runs the batch, and when it runs. */}
            <Separator className="my-3" />

            <FieldGrid>
              <Field
                label="Start Date"
                value={formatDate(batch.start_date)}
              />

              <Field
                label="End Date"
                value={formatDate(batch.end_date)}
              />

              <Field
                label="Start Time"
                value={formatTime(batch.start_time)}
              />

              <Field
                label="End Time"
                value={formatTime(batch.end_time)}
              />
            </FieldGrid>

          </CardContent>
        </Card>
      </div>

      {/* ================= ENROLLMENT ================= */}

      <div className="lg:col-span-5">
        <Card className="h-full">
          <CardContent className="p-4">

            <SectionHeading icon={Users}>
              Enrollment
            </SectionHeading>

            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {capacity > 0
                  ? `${enrolledStudents} of ${capacity} seats filled`
                  : `${enrolledStudents} enrolled`}
              </p>

              {capacity > 0 && (
                <p className="font-bold">
                  {Math.round(enrolledRatio * 100)}%
                </p>
              )}
            </div>

            <Progress
              value={enrolledRatio * 100}
              className="h-2 rounded-full bg-primary/10 [&>div]:rounded-full"
            />

            <Separator className="my-3" />

            <FieldGrid columns={3}>
              <Field
                label="Capacity"
                value={capacity || null}
              />

              <Field
                label="Enrolled"
                value={enrolledStudents}
              />

              <Field
                label="Available"
                value={availableSeats}
              />
            </FieldGrid>

          </CardContent>
        </Card>
      </div>

      {/* ================= DESCRIPTION ================= */}

      <div className="lg:col-span-12">
        <Card>
          <CardContent className="p-4">

            <SectionHeading icon={FileText}>
              Description
            </SectionHeading>

            {batch.description ? (
              <p className="max-w-[68ch] text-base leading-relaxed whitespace-pre-wrap">
                {batch.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No description added for this batch.
              </p>
            )}

          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default BatchOverview;
