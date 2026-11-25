import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStudentChecklist } from "../api/progressApi";

import PageHeader from "../components/common/PageHeader";
import TableCard from "../components/common/TableCard";
import useSnackbar from "../components/common/useSnackbar";
import RemarksDialog from "../components/RemarksDialog";

// ================= HELPERS =================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Groups lessons by module, preserving the order they first appear in.
const groupLessonsByModule = (lessons = []) => {
  const groups = [];

  lessons.forEach((lesson) => {
    const existing = groups.find(
      (group) => group.module === lesson.module
    );

    if (existing) {
      existing.lessons.push(lesson);
    } else {
      groups.push({
        module: lesson.module,
        lessons: [lesson],
      });
    }
  });

  return groups;
};

// ================= MODULE ROW =================

function ModuleRow({ moduleGroup, open, onToggle, onMarkCompleted }) {
  const { module, lessons } = moduleGroup;

  const completedCount = lessons.filter(
    (lesson) => lesson.is_completed
  ).length;

  const modulePercent = Math.round(
    (completedCount / lessons.length) * 100
  );

  const isModuleComplete =
    completedCount === lessons.length;

  return (
    <>
      {/* MODULE HEADER ROW — clicking toggles the lessons below */}
      <TableRow
        className="cursor-pointer bg-primary/[0.03] hover:bg-primary/10"
        onClick={onToggle}
      >
        <TableCell className="w-[52px]">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            aria-label={
              open
                ? `Collapse ${module}`
                : `Expand ${module}`
            }
            className="text-muted-foreground"
          >
            {open ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground">
              {module}
            </p>

            <Badge variant="outline" className="h-[22px] text-[11px] font-semibold">
              {lessons.length} lessons
            </Badge>
          </div>
        </TableCell>

        <TableCell className="text-center whitespace-nowrap">
          <p
            className={`text-sm font-semibold ${
              isModuleComplete ? "text-success" : "text-muted-foreground"
            }`}
          >
            {completedCount}/{lessons.length}
          </p>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-1.5">
            <Progress
              value={modulePercent}
              className="h-2 flex-1 rounded-full bg-primary/10 [&>div]:rounded-full"
            />

            <p className="min-w-[38px] text-right text-sm font-bold text-muted-foreground">
              {modulePercent}%
            </p>
          </div>
        </TableCell>
      </TableRow>

      {/* LESSON ROWS — expand downward when the module is open */}
      {open && (
        <TableRow>
          <TableCell
            colSpan={4}
            className="border-b-0 bg-muted/50 p-0"
          >
            <div className="py-1">
              {lessons.map((lesson) => {
                const isCompleted = lesson.is_completed;

                return (
                  <div
                    key={lesson.lesson_id}
                    className="flex items-center gap-2 px-3 py-1.2 hover:bg-card"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-border" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {lesson.lesson_title}
                      </p>

                      <p className="mt-0.2 block text-xs text-muted-foreground/70">
                        Lesson {lesson.lesson_order}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-[11px] font-semibold ${
                        isCompleted
                          ? "bg-success/15 text-success dark:bg-success/20"
                          : "bg-warning/15 text-warning dark:bg-warning/20"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Pending"}
                    </Badge>

                    {isCompleted ? (
                      <p className="min-w-[110px] shrink-0 text-right text-xs text-muted-foreground/70">
                        {formatDate(lesson.completed_at)}
                      </p>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onMarkCompleted(lesson);
                        }}
                        className="min-w-0 shrink-0 border-success/40 px-2.5 text-success hover:bg-success/10 hover:text-success"
                      >
                        <Check data-icon="inline-start" />
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ================= PAGE =================

function CourseProgress() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [expandedModules, setExpandedModules] =
    useState({});

  const [remarksLesson, setRemarksLesson] =
    useState(null);

  const { showSnackbar } = useSnackbar();

  // ================= DATA =================

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(false);

        const response =
          await getStudentChecklist(id);

        if (active) {
          setProgress(response.data);
        }
      } catch (err) {
        console.error(
          "Failed to load course progress:",
          err.response?.data || err
        );

        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [id]);

  // ================= DERIVED =================

  const moduleGroups = useMemo(
    () =>
      groupLessonsByModule(
        progress?.lessons || []
      ),
    [progress]
  );

  const allLessons = useMemo(
    () => progress?.lessons || [],
    [progress]
  );

  const completedCount = useMemo(
    () =>
      allLessons.filter(
        (lesson) => lesson.is_completed
      ).length,
    [allLessons]
  );

  const overallPercent =
    allLessons.length > 0
      ? Math.round(
          (completedCount / allLessons.length) * 100
        )
      : 0;

  // ================= HANDLERS =================

  const handleToggleModule = (module) => {
    setExpandedModules((previous) => ({
      ...previous,
      [module]: !previous[module],
    }));
  };

  // Opens the remarks dialog for a pending lesson.
  const handleMarkCompleted = (lesson) => {
    setRemarksLesson(lesson);
  };

  // Called after a successful completion POST: reloads the checklist so the
  // row flips to Completed and the bars recalculate.
  const handleLessonCompleted = async () => {
    try {
      const response =
        await getStudentChecklist(id);

      setProgress(response.data);
      setRemarksLesson(null);

      showSnackbar(
        "Lesson marked as completed."
      );
    } catch (err) {
      console.error(
        "Failed to reload checklist:",
        err.response?.data || err
      );

      showSnackbar(
        "Lesson completed, but failed to refresh the checklist.",
        "error"
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ================= ERROR =================

  if (error || !progress) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Course Progress"
          subtitle="Student learning progress"
          back={{
            label: "Back to Students",
            onClick: () => navigate("/students"),
          }}
        />

        <TableCard>
          <div className="py-8 text-center">
            <p className="font-semibold">
              Could not load course progress.
            </p>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        </TableCard>
      </div>
    );
  }

  // ================= RENDER =================

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* ================= HEADER ================= */}

      <PageHeader
        title={progress.course || "Course Progress"}
        subtitle={`${progress.student_name} • Student ID ${progress.student_id}`}
        back={{
          label: "Back to Students",
          onClick: () => navigate("/students"),
        }}
        meta={
          <>
            <Badge
              variant="secondary"
              className={
                overallPercent === 100
                  ? "bg-success/15 text-success dark:bg-success/20"
                  : "bg-primary/10 text-primary"
              }
            >
              {completedCount} of {allLessons.length} lessons completed
            </Badge>

            <Badge variant="outline">
              {overallPercent}% overall
            </Badge>
          </>
        }
      />

      {/* ================= OVERALL PROGRESS ================= */}

      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Overall completion
          </p>

          <p className="font-bold">
            {overallPercent}%
          </p>
        </div>

        <Progress
          value={overallPercent}
          className="h-2.5 rounded-full bg-primary/10 [&>div]:rounded-full"
        />
      </div>

      {/* ================= MODULES TABLE ================= */}

      {moduleGroups.length === 0 ? (
        <TableCard>
          <div className="py-8 text-center">
            <p className="font-semibold">
              No lessons available yet.
            </p>

            <p className="mt-0.5 text-sm text-muted-foreground">
              This student has no course lessons
              assigned yet.
            </p>
          </div>
        </TableCard>
      ) : (
        <TableCard>
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[52px]" />
                <TableHead>Module</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="w-[35%]">Progress</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {moduleGroups.map((moduleGroup) => (
                <ModuleRow
                  key={moduleGroup.module}
                  moduleGroup={moduleGroup}
                  open={Boolean(
                    expandedModules[
                      moduleGroup.module
                    ]
                  )}
                  onToggle={() =>
                    handleToggleModule(
                      moduleGroup.module
                    )
                  }
                  onMarkCompleted={
                    handleMarkCompleted
                  }
                />
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <RemarksDialog
        open={Boolean(remarksLesson)}
        studentId={id}
        lesson={remarksLesson}
        onClose={() => setRemarksLesson(null)}
        onSuccess={handleLessonCompleted}
      />
    </div>
  );
}

export default CourseProgress;
