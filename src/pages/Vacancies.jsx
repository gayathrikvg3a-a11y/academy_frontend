import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  deleteVacancy,
  getVacancies,
} from "../api/vacancyApi";

import VacancyFilters from "../components/VacancyFilters";
import VacancyTable from "../components/VacancyTable";
import VacancyForm from "../components/VacancyForm";
import VacancyDialog from "../components/VacancyDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { getVacancyStatus } from "../utils/vacancies";

const initialFilters = {
  search: "",
  department: "",
  job_type: "",
  status: "",
};

export default function Vacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const { showSnackbar } = useSnackbar();

  // ==========================
  // Load Vacancies
  // ==========================

  const loadVacancies = async () => {
    try {
      setLoading(true);

      const response = await getVacancies();

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      // `display_order` exists so the careers page can be arranged by hand;
      // honour it here too, falling back to the title for equal orders.
      setVacancies(
        [...rows].sort(
          (a, b) =>
            (a.display_order ?? 0) - (b.display_order ?? 0) ||
            String(a.title || "").localeCompare(String(b.title || ""))
        )
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load vacancies.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
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

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // The department list is whatever the data actually contains, so the filter
  // never offers a department with no openings behind it.
  const departments = useMemo(() => {
    return [
      ...new Set(
        vacancies
          .map((vacancy) => vacancy.department)
          .filter(Boolean)
      ),
    ].sort();
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return vacancies.filter((vacancy) => {
      const matchesSearch =
        !search ||
        vacancy.title?.toLowerCase().includes(search) ||
        vacancy.department?.toLowerCase().includes(search) ||
        vacancy.location?.toLowerCase().includes(search) ||
        vacancy.experience?.toLowerCase().includes(search);

      const matchesDepartment =
        !filters.department ||
        vacancy.department === filters.department;

      const matchesJobType =
        !filters.job_type ||
        vacancy.job_type === filters.job_type;

      const matchesStatus =
        !filters.status ||
        getVacancyStatus(vacancy) === filters.status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesJobType &&
        matchesStatus
      );
    });
  }, [vacancies, filters]);

  // ==========================
  // Summary
  // ==========================

  const openCount = useMemo(
    () =>
      vacancies.filter(
        (vacancy) => getVacancyStatus(vacancy) === "OPEN"
      ).length,
    [vacancies]
  );

  // ==========================
  // Actions
  // ==========================

  const handleAdd = () => {
    setSelectedVacancy(null);
    setOpenForm(true);
  };

  const handleView = (vacancy) => {
    setSelectedVacancy(vacancy);
    setOpenDialog(true);
  };

  const handleEdit = (vacancy) => {
    setSelectedVacancy(vacancy);
    setOpenDialog(false);
    setOpenForm(true);
  };

  const handleDelete = (vacancy) => {
    askConfirm({
      title: "Delete Vacancy",
      message: `Delete "${vacancy.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(vacancy),
    });
  };

  const confirmDelete = async (vacancy) => {
    try {
      await deleteVacancy(vacancy.id);

      await loadVacancies();

      showSnackbar("Vacancy deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete vacancy.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Vacancies"
        subtitle={
          loading
            ? "Loading job openings…"
            : `${openCount} open ${openCount === 1 ? "role" : "roles"} of ${vacancies.length} posted`
        }
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Post Vacancy
          </Button>
        }
      />

      <VacancyFilters
        filters={filters}
        departments={departments}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <VacancyTable
        rows={filteredVacancies}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <VacancyForm
        open={openForm}
        vacancy={selectedVacancy}
        onClose={() => {
          setOpenForm(false);
          setSelectedVacancy(null);
        }}
        onSuccess={async () => {
          // Read before the form's onClose clears the selection.
          const wasEdit = Boolean(selectedVacancy);

          await loadVacancies();

          showSnackbar(
            wasEdit
              ? "Vacancy updated successfully."
              : "Vacancy posted successfully."
          );
        }}
      />

      <VacancyDialog
        open={openDialog}
        vacancy={selectedVacancy}
        onEdit={handleEdit}
        onClose={() => {
          setOpenDialog(false);
          setSelectedVacancy(null);
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
