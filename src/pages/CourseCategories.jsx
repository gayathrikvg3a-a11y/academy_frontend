import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  deleteCourseCategory,
  getCourseCategories,
} from "../api/courseCategoryApi";

import CourseCategoryFilters from "../components/CourseCategoryFilters";
import CourseCategoryForm from "../components/CourseCategoryForm";
import CourseCategoryTable from "../components/CourseCategoryTable";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function CourseCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

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
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getCourseCategories();

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // The API sends them by name; list them in their display order,
      // falling back to the name for equal orders.
      setCategories(
        [...rows].sort(
          (a, b) =>
            (a.display_order ?? 0) - (b.display_order ?? 0) ||
            String(a.name || "").localeCompare(String(b.name || ""))
        )
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load course categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      (category.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [categories, search]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedCategory(null);
    setOpenForm(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  const handleDelete = (category) => {
    askConfirm({
      title: "Delete Course Category",
      message: `Delete "${category.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(category),
    });
  };

  const confirmDelete = async (category) => {
    try {
      await deleteCourseCategory(category.id);

      await loadCategories();

      showSnackbar("Course category deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete course category.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedCategory(null);
    setOpenForm(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedCategory);

    handleCloseForm();

    await loadCategories();

    showSnackbar(
      wasEdit
        ? "Course category updated successfully."
        : "Course category created successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Course Categories"
        subtitle="Group courses into categories"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Category
          </Button>
        }
      />

      <CourseCategoryFilters
        search={search}
        setSearch={setSearch}
        onClearFilters={() => setSearch("")}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <CourseCategoryTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CourseCategoryForm
        open={openForm}
        category={selectedCategory}
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

export default CourseCategories;
