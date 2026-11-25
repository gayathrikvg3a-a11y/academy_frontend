import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import api from "../api/axios";

import GalleryFilters from "../components/GalleryFilters";
import GalleryTable from "../components/GalleryTable";
import AlbumForm from "../components/AlbumForm";
import GalleryItemsDialog from "../components/GalleryItemsDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function Gallery() {
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState(null);

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
    loadAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A silent reload keeps the rows on screen while they are replaced, which is
  // what a refresh behind a closing dialog wants — the spinner is for an open
  // with nothing to show yet.
  const loadAlbums = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await api.get("albums/");

      setAlbums(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load albums.", "error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch = album.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "" ||
        String(album.is_active) === status;

      return matchesSearch && matchesStatus;
    });
  }, [albums, search, status]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedAlbum(null);
    setOpenForm(true);
  };

  const handleEdit = (album) => {
    setSelectedAlbum(album);
    setOpenForm(true);
  };

  const handleView = (album) => {
    setSelectedAlbum(album);
    setOpenDialog(true);
  };

  const handleDelete = (album) => {
    askConfirm({
      title: "Delete Album",
      message: `Delete "${album.title}"? All media in this album will be removed.`,
      onConfirm: () => confirmDelete(album),
    });
  };

  const confirmDelete = async (album) => {
    try {
      await api.delete(`albums/${album.id}/`);

      await loadAlbums();

      showSnackbar("Album deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete album.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedAlbum(null);
    setOpenForm(false);
  };

  const handleCloseDialog = () => {
    setSelectedAlbum(null);
    setOpenDialog(false);

    // Media added or deleted inside the dialog moves the album's item count,
    // and the row carries the nested media the next open seeds from, so the
    // table is stale by the time the dialog closes.
    loadAlbums({ silent: true });
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedAlbum);

    handleCloseForm();

    await loadAlbums();

    showSnackbar(
      wasEdit
        ? "Album updated successfully."
        : "Album created successfully."
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Gallery"
        subtitle="Manage gallery albums"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Album
          </Button>
        }
      />

      <GalleryFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <GalleryTable
          albums={filteredAlbums}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Album */}
      <AlbumForm
        open={openForm}
        album={selectedAlbum}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      {/* View Album Media */}
      <GalleryItemsDialog
        open={openDialog}
        album={selectedAlbum}
        onClose={handleCloseDialog}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default Gallery;
