import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import api from "../api/axios";

import EventFilters from "../components/EventFilters";
import EventTable from "../components/EventTable";
import EventForm from "../components/EventForm";
import EventDialog from "../components/EventDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function Events() {
  const [events, setEvents] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [date, setDate] =
    useState("");

  const [openForm, setOpenForm] =
    useState(false);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("events/");

      setEvents(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "" ||
        String(event.is_active) ===
          status;

      const matchesDate =
        date === "" ||
        event.event_date === date;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    events,
    search,
    status,
    date,
  ]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedEvent(null);
    setOpenForm(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setOpenForm(true);
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleDelete = (event) => {
    askConfirm({
      title: "Delete Event",
      message: `Delete "${event.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(event),
    });
  };

  const confirmDelete = async (event) => {
    try {
      await api.delete(
        `events/${event.id}/`
      );

      await loadEvents();

      showSnackbar("Event deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete event.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedEvent(null);
    setOpenForm(false);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
    setOpenDialog(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedEvent);

    handleCloseForm();

    await loadEvents();

    showSnackbar(
      wasEdit
        ? "Event updated successfully."
        : "Event created successfully."
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setDate("");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Events"
        subtitle="Manage academy events"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Event
          </Button>
        }
      />

      <EventFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <EventTable
          events={filteredEvents}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <EventForm
        open={openForm}
        event={selectedEvent}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <EventDialog
        open={openDialog}
        event={selectedEvent}
        onClose={handleCloseDialog}
        onEdit={(event) => {
          handleCloseDialog();
          handleEdit(event);
        }}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default Events;
