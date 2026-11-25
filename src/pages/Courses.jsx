import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import CourseFilters from "../components/CourseFilters";
import CourseTable from "../components/CourseTable";
import CourseForm from "../components/CourseForm";
import SeoDialog from "../components/SeoDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { normalizeApiErrors } from "../utils/formErrors";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../api/courseApi";
import { getCourseCategories } from "../api/courseCategoryApi";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [openSeo, setOpenSeo] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formErrors, setFormErrors] = useState(null);

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
    loadCourses();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Feeds both the category filter and the form's category dropdown.
  const loadCategories = async () => {
    try {
      const response = await getCourseCategories();

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load course categories.", "error");
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);

      const response = await getCourses();

      setCourses(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load courses.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.course_code.toLowerCase().includes(search.toLowerCase());

      // `category` is the id; the select hands its value back as a string.
      const matchesCategory =
        category === "" || String(course.category) === category;

      const matchesStatus =
        status === "" ||
        String(course.is_active) === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [courses, search, category, status]);

  const handleAdd = () => {
    setSelectedCourse(null);
    setFormErrors(null);
    setOpenForm(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormErrors(null);
    setOpenSeo(false);
    setOpenForm(true);
  };

  const handleSeo = (course) => {
    setSelectedCourse(course);
    setOpenSeo(true);
  };

  const handleCloseSeo = () => {
    setOpenSeo(false);
    setSelectedCourse(null);
  };

  const handleClose = () => {
    setSelectedCourse(null);
    setFormErrors(null);
    setOpenForm(false);
  };

  const handleSave = async (formData) => {
    const isEdit = Boolean(selectedCourse);

    try {
      setSaving(true);
      setFormErrors(null);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        if (
          key === "learning_outcomes" ||
          key === "prerequisites"
        ) {
          data.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (isEdit) {
        await updateCourse(selectedCourse.id, data);
      } else {
        await createCourse(data);
      }

      handleClose();

      await loadCourses();

      showSnackbar(
        isEdit
          ? "Course updated successfully."
          : "Course created successfully."
      );
    } catch (error) {
      console.error(error);

      // Handed to the form so each message lands under its own field.
      setFormErrors(
        normalizeApiErrors(
          error,
          "Failed to save course."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (course) => {
    askConfirm({
      title: "Delete Course",
      message: `Delete "${course.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(course),
    });
  };

  const confirmDelete = async (course) => {
    try {
      await deleteCourse(course.id);

      await loadCourses();

      showSnackbar("Course deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete course.", "error");
    }
  };

  const handleView = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Courses"
        subtitle="Manage academy courses"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Course
          </Button>
        }
      />

      <CourseFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
        status={status}
        setStatus={setStatus}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <CourseTable
          courses={filteredCourses}
          onView={handleView}
          onEdit={handleEdit}
          onSeo={handleSeo}
          onDelete={handleDelete}
        />
      )}

      <CourseForm
        open={openForm}
        course={selectedCourse}
        courses={courses}
        categories={categories}
        onClose={handleClose}
        onSave={handleSave}
        saving={saving}
        serverErrors={formErrors}
      />

      <SeoDialog
        open={openSeo}
        item={selectedCourse}
        name={selectedCourse?.name}
        onEdit={handleEdit}
        onClose={handleCloseSeo}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default Courses;
