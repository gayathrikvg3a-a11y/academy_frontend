import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

import { getContactInformation } from "../api/contactInformationApi";

import ContactInformationForm from "../components/ContactInformationForm";

import PageHeader from "../components/common/PageHeader";
import useSnackbar from "../components/common/useSnackbar";

function ContactInformation() {
  // The one record the API lists.
  const [record, setRecord] = useState(null);

  const [loading, setLoading] = useState(false);

  // A failed load must not look like "nothing saved yet": saving the blank
  // form would try to create a second record.
  const [loadFailed, setLoadFailed] = useState(false);

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(() => {
    loadRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecord = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await getContactInformation();

      const list = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setRecord(list[0] || null);
      setLoadFailed(false);
    } catch (error) {
      console.error(error);

      setLoadFailed(true);

      showSnackbar("Failed to load contact information.", "error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSuccess = async () => {
    await loadRecord({ silent: true });

    showSnackbar("Contact information saved.");
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Contact Information"
        subtitle="How visitors reach the academy, shown in the website's footer and on its contact page"
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : loadFailed ? (
        <div className="rounded-xl border py-10 text-center text-muted-foreground">
          Contact information could not be loaded. Refresh the page to try again.
        </div>
      ) : (
        <div className="max-w-3xl">
          <ContactInformationForm
            record={record}
            onSuccess={handleSuccess}
          />
        </div>
      )}

    </div>
  );
}

export default ContactInformation;
