import {
  CirclePlay,
  ExternalLink,
  FileText,
  FileText as Notes,
  Pencil,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";
import { getVideoEmbed } from "../utils/videoEmbed";

// ================= LESSON DIALOG =================
//
// The whole lesson, played and read in place. The materials sit in tabs that
// mirror the card's badges, so only one is on screen at a time — and since an
// inactive tab unmounts, switching away from the video stops it. The lesson
// comes from the module it was listed under, so there is no extra request.

function OpenInNewTab({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-w-0 items-center gap-1.5 text-primary hover:underline"
    >
      <ExternalLink className="size-4 shrink-0" />
      <span className="truncate">{children}</span>
    </a>
  );
}

// Capped by width and by screen height (71svh wide is 40svh tall at 16:9), so
// the player never pushes the rest of the lesson off a laptop screen.
const PLAYER_CLASS =
  "mx-auto aspect-video w-full max-w-[min(36rem,71svh)] rounded-lg bg-black";

function VideoPlayer({ url, title }) {
  const embed = getVideoEmbed(url);

  if (!embed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
        <p className="text-muted-foreground">
          This link can't be played here.
        </p>
        <OpenInNewTab href={url}>Watch on its site</OpenInNewTab>
      </div>
    );
  }

  return embed.type === "file" ? (
    <video
      controls
      preload="metadata"
      src={embed.src}
      className={PLAYER_CLASS}
    />
  ) : (
    <iframe
      src={embed.src}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      // YouTube refuses to play for an embedder it can't identify.
      referrerPolicy="strict-origin-when-cross-origin"
      className={PLAYER_CLASS}
    />
  );
}

function LessonDialog({
  lesson,
  onClose,
  onEdit,
}) {
  const pdfUrl = resolveMediaUrl(lesson?.pdf_file);

  const materials = lesson
    ? [
        lesson.video_url && { value: "video", label: "Video", icon: CirclePlay },
        pdfUrl && { value: "pdf", label: "PDF", icon: FileText },
        lesson.notes && { value: "notes", label: "Notes", icon: Notes },
      ].filter(Boolean)
    : [];

  return (
    <Dialog open={Boolean(lesson)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
        {lesson && (
          <>
            <DialogHeader>
              <DialogTitle>{lesson.lesson_title}</DialogTitle>
              <DialogDescription>
                {[lesson.module_title, lesson.topic_title, `Lesson ${lesson.lesson_order}`]
                  .filter(Boolean)
                  .join(" · ")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    lesson.is_published
                      ? "bg-success/15 text-success dark:bg-success/20"
                      : "bg-warning/15 text-warning dark:bg-warning/20"
                  }
                >
                  {lesson.is_published ? "Published" : "Draft"}
                </Badge>

                <Badge variant="secondary">
                  {lesson.duration_minutes || 0} min
                </Badge>
              </div>

              {lesson.description && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {lesson.description}
                </p>
              )}

              <Separator />

              {materials.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">
                  No video, PDF or notes added to this lesson yet.
                </p>
              ) : (
                <Tabs key={lesson.id} defaultValue={materials[0].value}>
                  <TabsList variant="line">
                    {materials.map(({ value, label, icon: Icon }) => (
                      <TabsTrigger key={value} value={value}>
                        <Icon data-icon="inline-start" />
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {lesson.video_url && (
                    <TabsContent value="video" className="pt-2">
                      <VideoPlayer
                        url={lesson.video_url}
                        title={lesson.lesson_title}
                      />
                    </TabsContent>
                  )}

                  {pdfUrl && (
                    <TabsContent value="pdf" className="flex flex-col gap-2 pt-2">
                      <iframe
                        src={pdfUrl}
                        title={`${lesson.lesson_title} PDF`}
                        className="h-[70svh] w-full rounded-lg border"
                      />

                      {/* Phones only render the first page inline. */}
                      <OpenInNewTab href={pdfUrl}>
                        {mediaFileName(lesson.pdf_file) || "Open PDF"}
                      </OpenInNewTab>
                    </TabsContent>
                  )}

                  {lesson.notes && (
                    <TabsContent value="notes" className="pt-2">
                      <p className="whitespace-pre-line">{lesson.notes}</p>
                    </TabsContent>
                  )}
                </Tabs>
              )}

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>

              <Button onClick={() => onEdit(lesson)}>
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LessonDialog;
