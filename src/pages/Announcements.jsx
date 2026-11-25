import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  deleteAnnouncement,
  getAnnouncements,
} from "../api/announcementApi";

import AnnouncementFilters from "../components/AnnouncementFilters";
import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementTable from "../components/AnnouncementTable";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

const initialFilters = {
  search: "",
  status: "",
};

// Announcements are few, so every page is fetched and the search works on
// all of them. An endpoint that isn't paginated answers the first request
// with the whole list.
async function fetchAllAnnouncements() {
  const rows = [];

  for (let page = 1; ; page += 1) {
    const { data } = await getAnnouncements({ page });

    if (Array.isArray(data)) {
      return data;
    }

    rows.push(...(data?.results || []));

    if (!data?.next) {
      return rows;
    }
  }
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(initialFilters);

  const [openForm, setOpenForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const { showSnackbar } = useSnackbar();

  // ==========================
  // Load Announcements
  // ==========================

  // Only the first load shows the placeholder rows; a reload after a save
  // keeps the table on screen until the new list arrives.
  const loadAnnouncements = async () => {
    try {
      setAnnouncements(await fetchAllAnnouncements());
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load announcements.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // Filters
  // ==========================

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasFilters =
    filters.search.trim() !== "" || filters.status !== "";

  // Newest first. ISO timestamps sort as text; ones without a date go last.
  const filteredAnnouncements = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return announcements
      .filter((announcement) => {
        const matchesSearch =
          !query ||
          [announcement.title, announcement.description].some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

        const matchesStatus =
          !filters.status ||
          (filters.status === "ACTIVE" && announcement.is_active) ||
          (filters.status === "INACTIVE" && !announcement.is_active) ||
          (filters.status === "IMPORTANT" && announcement.is_important);

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          (b.published_at || "").localeCompare(a.published_at || "") ||
          b.id - a.id
      );
  }, [announcements, filters]);

  // ==========================
  // Actions
  // ==========================

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    setOpenForm(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAnnouncement(null);
  };

  const handleSuccess = async () => {
    // Read before closing the form clears the selection.
    const wasEdit = Boolean(selectedAnnouncement);

    handleCloseForm();

    await loadAnnouncements();

    showSnackbar(
      wasEdit
        ? "Announcement updated successfully."
        : "Announcement posted successfully."
    );
  };

  const handleDelete = (announcement) => {
    askConfirm({
      title: "Delete Announcement",
      message: `Delete "${announcement.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(announcement),
    });
  };

  const confirmDelete = async (announcement) => {
    try {
      await deleteAnnouncement(announcement.id);

      await loadAnnouncements();

      showSnackbar("Announcement deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete announcement.", "error");
    }
  };

  const activeCount = announcements.filter(
    (announcement) => announcement.is_active
  ).length;

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Announcements"
        subtitle={
          loading
            ? "Loading announcements…"
            : `${activeCount} active of ${announcements.length} posted`
        }
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            New Announcement
          </Button>
        }
      />

      <AnnouncementFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(initialFilters)}
      />

      <AnnouncementTable
        rows={filteredAnnouncements}
        loading={loading}
        filtered={hasFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AnnouncementForm
        open={openForm}
        announcement={selectedAnnouncement}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />

    </div>
  );
}
