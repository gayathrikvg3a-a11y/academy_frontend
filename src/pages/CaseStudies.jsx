import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { deleteCaseStudy, getCaseStudies } from "../api/caseStudyApi";

import CaseStudyFilters from "../components/CaseStudyFilters";
import CaseStudyForm from "../components/CaseStudyForm";
import CaseStudyTable from "../components/CaseStudyTable";
import SeoDialog from "../components/SeoDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [openSeo, setOpenSeo] = useState(false);

  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);

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
    loadCaseStudies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCaseStudies = async () => {
    try {
      setLoading(true);

      const response = await getCaseStudies();

      setCaseStudies(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load case studies.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Newest case study first. Dates are "YYYY-MM-DD", so they sort as text;
  // case studies on the same day go by the order they were added.
  const filteredCaseStudies = useMemo(() => {
    return caseStudies
      .filter((caseStudy) =>
        (caseStudy.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          (b.case_study_date || "").localeCompare(a.case_study_date || "") ||
          b.id - a.id
      );
  }, [caseStudies, search]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedCaseStudy(null);
    setOpenForm(true);
  };

  const handleEdit = (caseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setOpenSeo(false);
    setOpenForm(true);
  };

  const handleSeo = (caseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setOpenSeo(true);
  };

  const handleCloseSeo = () => {
    setOpenSeo(false);
    setSelectedCaseStudy(null);
  };

  const handleDelete = (caseStudy) => {
    askConfirm({
      title: "Delete Case Study",
      message: `Delete "${caseStudy.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(caseStudy),
    });
  };

  const confirmDelete = async (caseStudy) => {
    try {
      await deleteCaseStudy(caseStudy.id);

      await loadCaseStudies();

      showSnackbar("Case study deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete case study.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedCaseStudy(null);
    setOpenForm(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedCaseStudy);

    handleCloseForm();

    await loadCaseStudies();

    showSnackbar(
      wasEdit
        ? "Case study updated successfully."
        : "Case study created successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Case Studies"
        subtitle="Manage the website's case studies"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Case Study
          </Button>
        }
      />

      <CaseStudyFilters
        search={search}
        setSearch={setSearch}
        onClearFilters={() => setSearch("")}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <CaseStudyTable
          caseStudies={filteredCaseStudies}
          onEdit={handleEdit}
          onSeo={handleSeo}
          onDelete={handleDelete}
        />
      )}

      <CaseStudyForm
        open={openForm}
        caseStudy={selectedCaseStudy}
        caseStudies={caseStudies}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <SeoDialog
        open={openSeo}
        item={selectedCaseStudy}
        name={selectedCaseStudy?.title}
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

export default CaseStudies;
