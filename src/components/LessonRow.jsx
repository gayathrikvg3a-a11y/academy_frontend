import {
  CircleDashed,
  CirclePlay,
  Eye,
  FileText,
  MoreVertical,
  NotebookText,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatMinutes } from "../utils/curriculum";

// ================= LESSON ROW =================
//
// One lesson in a topic, kept to a single quiet line: what it is (the
// icon of its main material), its title, and its length. Everything else
// is one click away in the lesson dialog, which the row opens.

// With a mouse, the menu shows only on the row being pointed at or focused,
// so a long list isn't a column of dots. Touch screens always show it.
const REVEAL_ON_HOVER =
  "text-muted-foreground transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/lesson:opacity-100 pointer-fine:group-focus-within/lesson:opacity-100 pointer-fine:aria-expanded:opacity-100";

// The lesson's main material, video first, since most lessons are one.
function materialOf(lesson) {
  if (lesson.video_url) return { icon: CirclePlay, label: "Video lesson" };
  if (lesson.pdf_file) return { icon: FileText, label: "PDF lesson" };
  if (lesson.notes) return { icon: NotebookText, label: "Notes lesson" };
  return { icon: CircleDashed, label: "No material yet" };
}

function LessonRow({
  lesson,
  onView,
  onEdit,
  onDelete,
}) {
  const material = materialOf(lesson);
  const MaterialIcon = material.icon;

  return (
    <li className="group/lesson -mx-2 flex items-center gap-1 rounded-md transition-colors hover:bg-muted/70 has-[[aria-expanded=true]]:bg-muted/70">
      <button
        type="button"
        onClick={() => onView?.(lesson)}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 pl-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MaterialIcon
          role="img"
          aria-label={material.label}
          className="size-4 shrink-0 text-muted-foreground"
        />

        <span className="line-clamp-2 min-w-0 flex-1">
          {lesson.lesson_title}
        </span>

        {!lesson.is_published && (
          <Badge
            variant="secondary"
            className="bg-warning/15 text-warning dark:bg-warning/20"
          >
            Draft
          </Badge>
        )}

        {lesson.duration_minutes > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatMinutes(lesson.duration_minutes)}
          </span>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${lesson.lesson_title}`}
              className={REVEAL_ON_HOVER}
            />
          }
        >
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView?.(lesson)}>
            <Eye /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(lesson)}>
            <Pencil /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete?.(lesson)}
          >
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export default LessonRow;
