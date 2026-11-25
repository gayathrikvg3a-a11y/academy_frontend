import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { getUsers } from "../api/userApi";
import {
  getWebsiteEnquiries,
  updateWebsiteEnquiryStatus,
} from "../api/websiteEnquiryApi";

import WebsiteEnquiryDialog from "../components/WebsiteEnquiryDialog";
import WebsiteEnquiryForm from "../components/WebsiteEnquiryForm";
import WebsiteEnquiryTable from "../components/WebsiteEnquiryTable";
import WebsiteEnquiryUpdateForm from "../components/WebsiteEnquiryUpdateForm";

import PageHeader from "../components/common/PageHeader";
import Pagination from "../components/common/Pagination";
import useSnackbar from "../components/common/useSnackbar";

const PAGE_SIZE = 10;

// What arrives through the website's contact form (see websiteEnquiryApi).
function WebsiteEnquiries() {
  const [enquiries, setEnquiries] = useState([]);

  const [total, setTotal] = useState(0);

  const [links, setLinks] = useState({ previous: false, next: false });

  const [page, setPage] = useState(1);

  // Bumped to fetch the current page again, such as after adding one.
  const [reload, setReload] = useState(0);

  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);

  const [viewing, setViewing] = useState(null);

  const [editing, setEditing] = useState(null);

  // The enquiry whose status is being saved, if any.
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // The CRM's staff, to name and choose who's responsible for an enquiry.
  const [users, setUsers] = useState([]);

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(() => {
    // A slow answer for a page already left behind is dropped.
    let current = true;

    const loadEnquiries = async () => {
      try {
        setLoading(true);

        const response = await getWebsiteEnquiries({
          page,
          page_size: PAGE_SIZE,
        });

        if (!current) return;

        const data = response.data;

        setEnquiries(Array.isArray(data) ? data : data.results || []);
        setTotal(Array.isArray(data) ? data.length : data.count || 0);
        setLinks({
          previous: Boolean(data.previous),
          next: Boolean(data.next),
        });
      } catch (error) {
        if (!current) return;

        console.error(error);

        showSnackbar("Failed to load website enquiries.", "error");
      } finally {
        if (current) setLoading(false);
      }
    };

    loadEnquiries();

    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, reload]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();

        setUsers(Array.isArray(response.data) ? response.data : response.data.results || []);
      } catch (error) {
        console.error(error);

        showSnackbar("Failed to load users.", "error");
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new enquiry is the newest, so it shows at the top of the first page.
  const handleSuccess = () => {
    setOpenForm(false);
    setPage(1);
    setReload((count) => count + 1);

    showSnackbar("Enquiry created successfully.");
  };

  // Saved first, then shown: the row keeps its old status if the save fails.
  const handleStatusChange = async (enquiry, status) => {
    try {
      setUpdatingStatus(enquiry.id);

      await updateWebsiteEnquiryStatus(enquiry.id, status);

      setEnquiries((current) =>
        current.map((item) => (item.id === enquiry.id ? { ...item, status } : item))
      );

      showSnackbar("Status updated successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to update status.", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // An updated enquiry keeps its place, so the page it's on is fetched again.
  const handleUpdated = () => {
    setEditing(null);
    setReload((count) => count + 1);

    showSnackbar("Enquiry updated successfully.");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Website Enquiries"
        subtitle="Enquiries sent through the website's contact form"
        action={
          <Button onClick={() => setOpenForm(true)}>
            <Plus data-icon="inline-start" />
            Add Enquiry
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <WebsiteEnquiryTable
            enquiries={enquiries}
            users={users}
            onView={setViewing}
            onEdit={setEditing}
            onStatusChange={handleStatusChange}
            updatingStatus={updatingStatus}
          />

          <Pagination
            page={page}
            setPage={setPage}
            hasPrevious={links.previous}
            hasNext={links.next}
            summary={`${total} ${total === 1 ? "enquiry" : "enquiries"}`}
          />
        </>
      )}

      <WebsiteEnquiryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleSuccess}
      />

      <WebsiteEnquiryUpdateForm
        enquiry={editing}
        users={users}
        onClose={() => setEditing(null)}
        onSuccess={handleUpdated}
      />

      <WebsiteEnquiryDialog
        enquiry={viewing}
        users={users}
        onClose={() => setViewing(null)}
        onEdit={(enquiry) => {
          setViewing(null);
          setEditing(enquiry);
        }}
      />
    </div>
  );
}

export default WebsiteEnquiries;
