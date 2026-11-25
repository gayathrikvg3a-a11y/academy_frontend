import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { deleteBanner, getBanners } from "../api/bannerApi";

import BannerFilters from "../components/BannerFilters";
import BannerForm from "../components/BannerForm";
import BannerTable from "../components/BannerTable";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function Banners() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [selectedBanner, setSelectedBanner] = useState(null);

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
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);

      const response = await getBanners();

      setBanners(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load banners.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      (banner.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [banners, search]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedBanner(null);
    setOpenForm(true);
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setOpenForm(true);
  };

  const handleDelete = (banner) => {
    askConfirm({
      title: "Delete Banner",
      message: `Delete "${banner.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(banner),
    });
  };

  const confirmDelete = async (banner) => {
    try {
      await deleteBanner(banner.id);

      await loadBanners();

      showSnackbar("Banner deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete banner.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedBanner(null);
    setOpenForm(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedBanner);

    handleCloseForm();

    await loadBanners();

    showSnackbar(
      wasEdit
        ? "Banner updated successfully."
        : "Banner created successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Banners"
        subtitle="Manage website banners"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Banner
          </Button>
        }
      />

      <BannerFilters
        search={search}
        setSearch={setSearch}
        onClearFilters={() => setSearch("")}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <BannerTable
          banners={filteredBanners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <BannerForm
        open={openForm}
        banner={selectedBanner}
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

export default Banners;
