import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import BatchFilters from "../components/BatchFilters";
import BatchTable from "../components/BatchTable";
import BatchForm from "../components/BatchForm";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { normalizeApiErrors } from "../utils/formErrors";

import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../api/batchApi";

import { getCourses } from "../api/courseApi";

function Batches() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [session, setSession] = useState("");
  const [status, setStatus] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
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
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [batchRes, courseRes] = await Promise.all([
        getBatches(),
        getCourses(),
      ]);

      setBatches(
        Array.isArray(batchRes.data)
          ? batchRes.data
          : batchRes.data.results || []
      );
      setCourses(courseRes.data);
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load batches.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        batch.batch_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        batch.batch_code
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCourse =
        course === "" ||
        String(batch.course) === String(course);

      const matchesSession =
        session === "" ||
        batch.session === session;

      const matchesStatus =
        status === "" ||
        batch.status === status;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesSession &&
        matchesStatus
      );
    });
  }, [
    batches,
    search,
    course,
    session,
    status,
  ]);

  const handleAdd = () => {
    setSelectedBatch(null);
    setFormErrors(null);
    setOpenForm(true);
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setFormErrors(null);
    setOpenForm(true);
  };

  const handleClose = () => {
    setSelectedBatch(null);
    setFormErrors(null);
    setOpenForm(false);
  };

  const handleSave = async (data) => {
    const isEdit = Boolean(selectedBatch);

    try {
      setSaving(true);
      setFormErrors(null);

      if (isEdit) {
        await updateBatch(selectedBatch.id, data);
      } else {
        await createBatch(data);
      }

      handleClose();

      await loadData();

      showSnackbar(
        isEdit
          ? "Batch updated successfully."
          : "Batch created successfully."
      );
    } catch (error) {
      console.error(error);

      setFormErrors(
        normalizeApiErrors(
          error,
          "Failed to save batch."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (batch) => {
    askConfirm({
      title: "Delete Batch",
      message: `Delete "${batch.batch_name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(batch),
    });
  };

  const confirmDelete = async (batch) => {
    try {
      await deleteBatch(batch.id);

      await loadData();

      showSnackbar("Batch deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete batch.", "error");
    }
  };

  const handleView = (batch) => {
    navigate(`/batches/${batch.id}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCourse("");
    setSession("");
    setStatus("");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Batches"
        subtitle="Manage academy batches"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Batch
          </Button>
        }
      />

      <BatchFilters
        search={search}
        setSearch={setSearch}
        course={course}
        setCourse={setCourse}
        session={session}
        setSession={setSession}
        status={status}
        setStatus={setStatus}
        courses={courses}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <BatchTable
          batches={filteredBatches}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <BatchForm
        open={openForm}
        batch={selectedBatch}
        courses={courses}
        onClose={handleClose}
        onSave={handleSave}
        saving={saving}
        serverErrors={formErrors}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default Batches;
