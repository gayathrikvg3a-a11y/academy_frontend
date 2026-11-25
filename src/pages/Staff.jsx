import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  deleteStaff,
  getStaff,
} from "../api/staffApi";

import StaffFilters from "../components/StaffFilters";
import StaffForm from "../components/StaffForm";
import StaffTable from "../components/StaffTable";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { usernameOf } from "../utils/staff";

const initialFilters = {
  search: "",
  role: "",
  domain: "",
};

// The staff list is short, so every page is fetched and the search and
// filters work on all of it. An endpoint that isn't paginated answers the
// first request with the whole list.
async function fetchAllStaff() {
  const rows = [];

  for (let page = 1; ; page += 1) {
    const { data } = await getStaff({ page });

    if (Array.isArray(data)) {
      return data;
    }

    rows.push(...(data?.results || []));

    if (!data?.next) {
      return rows;
    }
  }
}

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(initialFilters);

  const [openForm, setOpenForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const { showSnackbar } = useSnackbar();

  // ==========================
  // Load Staff
  // ==========================

  // Only the first load shows the placeholder rows; a reload after a save
  // keeps the table on screen until the new list arrives.
  const loadStaff = async () => {
    try {
      const rows = await fetchAllStaff();

      setStaffList(
        [...rows].sort((a, b) =>
          String(a.staff_name || "").localeCompare(String(b.staff_name || ""))
        )
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load staff.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
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

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.role !== "" ||
    filters.domain !== "";

  const filteredStaff = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return staffList.filter((staff) => {
      const matchesSearch =
        !search ||
        [staff.staff_name, staff.email, staff.phone, usernameOf(staff)].some(
          (value) => String(value || "").toLowerCase().includes(search)
        );

      const matchesRole = !filters.role || staff.role === filters.role;

      const matchesDomain = !filters.domain || staff.domain === filters.domain;

      return matchesSearch && matchesRole && matchesDomain;
    });
  }, [staffList, filters]);

  // ==========================
  // Actions
  // ==========================

  const handleAdd = () => {
    setSelectedStaff(null);
    setOpenForm(true);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedStaff(null);
  };

  const handleSuccess = async () => {
    // Read before closing the form clears the selection.
    const wasEdit = Boolean(selectedStaff);

    handleCloseForm();

    await loadStaff();

    showSnackbar(
      wasEdit
        ? "Staff member updated successfully."
        : "Staff member added successfully."
    );
  };

  const handleDelete = (staff) => {
    askConfirm({
      title: "Delete Staff",
      message: `Delete ${staff.staff_name}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(staff),
    });
  };

  const confirmDelete = async (staff) => {
    try {
      await deleteStaff(staff.id);

      await loadStaff();

      showSnackbar("Staff member deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete staff member.", "error");
    }
  };

  const count = staffList.length;

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Staff"
        subtitle={
          loading
            ? "Loading staff…"
            : `${count} ${count === 1 ? "staff member" : "staff members"} and their logins`
        }
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Staff
          </Button>
        }
      />

      <StaffFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(initialFilters)}
      />

      <StaffTable
        rows={filteredStaff}
        loading={loading}
        filtered={hasActiveFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StaffForm
        open={openForm}
        staff={selectedStaff}
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
