import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { deleteBlog, getBlogs } from "../api/blogApi";

import BlogFilters from "../components/BlogFilters";
import BlogForm from "../components/BlogForm";
import BlogTable from "../components/BlogTable";
import SeoDialog from "../components/SeoDialog";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function Blogs() {
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);

  const [openSeo, setOpenSeo] = useState(false);

  const [selectedBlog, setSelectedBlog] = useState(null);

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
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);

      const response = await getBlogs();

      setBlogs(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load blogs.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Newest post first, as on the website. Dates are "YYYY-MM-DD", so they
  // sort as text; posts on the same day go by the order they were added.
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((blog) =>
        (blog.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          (b.blog_date || "").localeCompare(a.blog_date || "") ||
          b.id - a.id
      );
  }, [blogs, search]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    setSelectedBlog(null);
    setOpenForm(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setOpenSeo(false);
    setOpenForm(true);
  };

  const handleSeo = (blog) => {
    setSelectedBlog(blog);
    setOpenSeo(true);
  };

  const handleCloseSeo = () => {
    setOpenSeo(false);
    setSelectedBlog(null);
  };

  const handleDelete = (blog) => {
    askConfirm({
      title: "Delete Blog",
      message: `Delete "${blog.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(blog),
    });
  };

  const confirmDelete = async (blog) => {
    try {
      await deleteBlog(blog.id);

      await loadBlogs();

      showSnackbar("Blog deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete blog.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedBlog(null);
    setOpenForm(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedBlog);

    handleCloseForm();

    await loadBlogs();

    showSnackbar(
      wasEdit
        ? "Blog updated successfully."
        : "Blog created successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Blogs"
        subtitle="Manage website blog posts"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Blog
          </Button>
        }
      />

      <BlogFilters
        search={search}
        setSearch={setSearch}
        onClearFilters={() => setSearch("")}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <BlogTable
          blogs={filteredBlogs}
          onEdit={handleEdit}
          onSeo={handleSeo}
          onDelete={handleDelete}
        />
      )}

      <BlogForm
        open={openForm}
        blog={selectedBlog}
        blogs={blogs}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <SeoDialog
        open={openSeo}
        item={selectedBlog}
        name={selectedBlog?.title}
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

export default Blogs;
