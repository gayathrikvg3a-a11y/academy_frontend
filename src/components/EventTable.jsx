import { useState } from "react";
import { MoreVertical, Eye, Pencil, Trash2, CalendarCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

function EventTable({
  events,
  onView,
  onEdit,
  onDelete,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ================= DATE =================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= TIME =================

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <TableCard>
        <Table className="min-w-[900px]">

          {/* ================= TABLE HEADER ================= */}

          <TableHeader>
            <TableRow>
              <TableHead>Banner</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          {/* ================= TABLE BODY ================= */}

          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <p className="font-medium text-muted-foreground">No events found</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Create your first event.</p>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  {/* ================= BANNER ================= */}

                  <TableCell>
                    <Avatar className="size-[70px] rounded-lg bg-muted after:rounded-lg">
                      <AvatarImage
                        src={event.banner_url || undefined}
                        alt={event.title}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg">
                        <CalendarCheck />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  {/* ================= EVENT ================= */}

                  <TableCell>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {event.description?.length > 50
                        ? `${event.description.substring(0, 50)}...`
                        : event.description}
                    </p>
                  </TableCell>

                  {/* ================= DATE ================= */}

                  <TableCell className="text-sm">
                    {formatDate(event.event_date)}
                  </TableCell>

                  {/* ================= TIME ================= */}

                  <TableCell className="text-sm">
                    {formatTime(event.event_time)}
                  </TableCell>

                  {/* ================= VENUE ================= */}

                  <TableCell className="text-sm">
                    {event.venue}
                  </TableCell>

                  {/* ================= STATUS ================= */}

                  <TableCell>
                    <StatusBadge status={event.is_active ? "ACTIVE" : "INACTIVE"} />
                  </TableCell>

                  {/* ================= ACTIONS ================= */}

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Event actions" />}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[180px]">
                        <DropdownMenuItem
                          onClick={() => {
                            onView(selectedEvent);
                          }}
                        >
                          <Eye /> View Event
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(selectedEvent);
                          }}
                        >
                          <Pencil /> Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            onDelete(selectedEvent);
                          }}
                        >
                          <Trash2 /> Delete Event
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

export default EventTable;
