import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ================= TOPIC SECTION =================
//
// One topic in a module: its number and title, then its lessons (passed as
// children) under the title, then Add Lesson where the next one will appear.

function TopicSection({
  topic,
  position,
  onAddLesson,
  onEdit,
  onDelete,
  children,
}) {
  const hasLessons = topic.lessons.length > 0;

  return (
    <li className="flex gap-2 py-3">
      <span className="w-6 shrink-0 pt-px text-sm text-muted-foreground tabular-nums">
        {position}.
      </span>

      <div className="min-w-0 flex-1">
        <div className="group/topic flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-balance">{topic.title}</h4>

            {topic.description && (
              <p className="mt-0.5 max-w-prose text-sm text-pretty text-muted-foreground">
                {topic.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${topic.title}`}
                  className="-mt-1 text-muted-foreground transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/topic:opacity-100 pointer-fine:group-focus-within/topic:opacity-100 pointer-fine:aria-expanded:opacity-100"
                />
              }
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(topic)}>
                <Pencil /> Edit Topic
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(topic)}
              >
                <Trash2 /> Delete Topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasLessons && (
          <ul className="mt-2">{children}</ul>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="mt-1 -ml-1.5 text-muted-foreground"
          onClick={() => onAddLesson?.(topic)}
        >
          <Plus data-icon="inline-start" />
          Add Lesson
        </Button>
      </div>
    </li>
  );
}

export default TopicSection;
