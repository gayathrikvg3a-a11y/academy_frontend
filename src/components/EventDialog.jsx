import { Pencil } from "lucide-react";

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

import StatusBadge from "./common/StatusBadge";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value || "-"}</p>
    </div>
  );
}

function EventDialog({
  open,
  onClose,
  event,
  onEdit,
}) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        {event.banner_url && (
          <div className="mb-3">
            <img
              src={event.banner_url}
              alt={event.title}
              className="max-h-[300px] w-full rounded-lg object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Field label="Description" value={event.description} />
          <Separator />
          <Field label="Date" value={event.event_date} />
          <Separator />
          <Field label="Time" value={event.event_time} />
          <Separator />
          <Field label="Venue" value={event.venue} />
          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Registration Link</p>
            {event.registration_link ? (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                {event.registration_link}
              </a>
            ) : (
              <p className="mt-0.5">-</p>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-sm text-muted-foreground">Status</p>
            <StatusBadge status={event.is_active ? "ACTIVE" : "INACTIVE"} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(event)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EventDialog;
