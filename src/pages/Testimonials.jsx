import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  deleteTestimonial,
  getTestimonials,
} from "../api/testimonialApi";

import TestimonialFilters from "../components/TestimonialFilters";
import TestimonialForm from "../components/TestimonialForm";
import TestimonialTable from "../components/TestimonialTable";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

// Testimonials are few, so every page is fetched and the search works on all
// of them. An endpoint that isn't paginated answers the first request with
// the whole list.
async function fetchAllTestimonials() {
  const rows = [];

  for (let page = 1; ; page += 1) {
    const { data } = await getTestimonials({ page });

    if (Array.isArray(data)) {
      return data;
    }

    rows.push(...(data?.results || []));

    if (!data?.next) {
      return rows;
    }
  }
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const { showSnackbar } = useSnackbar();

  // ==========================
  // Load Testimonials
  // ==========================

  // Only the first load shows the placeholder rows; a reload after a save
  // keeps the table on screen until the new list arrives.
  const loadTestimonials = async () => {
    try {
      setTestimonials(await fetchAllTestimonials());
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load testimonials.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // Search
  // ==========================

  const hasSearch = search.trim() !== "";

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return testimonials;

    return testimonials.filter((testimonial) =>
      [testimonial.name, testimonial.domain, testimonial.note].some(
        (value) => String(value || "").toLowerCase().includes(query)
      )
    );
  }, [testimonials, search]);

  // ==========================
  // Actions
  // ==========================

  const handleAdd = () => {
    setSelectedTestimonial(null);
    setOpenForm(true);
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTestimonial(null);
  };

  const handleSuccess = async () => {
    // Read before closing the form clears the selection.
    const wasEdit = Boolean(selectedTestimonial);

    handleCloseForm();

    await loadTestimonials();

    showSnackbar(
      wasEdit
        ? "Testimonial updated successfully."
        : "Testimonial added successfully."
    );
  };

  const handleDelete = (testimonial) => {
    askConfirm({
      title: "Delete Testimonial",
      message: `Delete ${testimonial.name}'s testimonial? This action cannot be undone.`,
      onConfirm: () => confirmDelete(testimonial),
    });
  };

  const confirmDelete = async (testimonial) => {
    try {
      await deleteTestimonial(testimonial.id);

      await loadTestimonials();

      showSnackbar("Testimonial deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete testimonial.", "error");
    }
  };

  const count = testimonials.length;

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Testimonials"
        subtitle={
          loading
            ? "Loading testimonials…"
            : `${count} ${count === 1 ? "testimonial" : "testimonials"} from students`
        }
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Testimonial
          </Button>
        }
      />

      <TestimonialFilters
        search={search}
        setSearch={setSearch}
        onClearFilters={() => setSearch("")}
      />

      <TestimonialTable
        rows={filteredTestimonials}
        loading={loading}
        filtered={hasSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TestimonialForm
        open={openForm}
        testimonial={selectedTestimonial}
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
