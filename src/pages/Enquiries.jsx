import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import api from "../api/axios";
import EnquiryForm from "../components/EnquiryForm";

import FormField from "../components/common/FormField";
import FormSelect from "../components/common/FormSelect";
import LoadingButton from "../components/common/LoadingButton";
import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import StatusBadge from "../components/common/StatusBadge";
import TableCard from "../components/common/TableCard";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium break-words">{value || "-"}</p>
    </div>
  );
}

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  // Enquiry Form
  const [formOpen, setFormOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);

  // View Dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewEnquiry, setViewEnquiry] = useState(null);

  // Call History
  const [callOpen, setCallOpen] = useState(false);
  const [callLoading, setCallLoading] = useState(false);

  const [callForm, setCallForm] = useState({
    call_status: "ANSWERED",
    feedback: "",
    next_follow_up_date: "",
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      const response = await api.get("enquiries/");
      setEnquiries(response.data);
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // ADD
  // -------------------------

  const handleAdd = () => {
    setEditingEnquiry(null);
    setFormOpen(true);
  };

  // -------------------------
  // EDIT
  // -------------------------

  const handleEdit = (enquiry) => {
    setEditingEnquiry(enquiry);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingEnquiry(null);
  };

  // -------------------------
  // VIEW
  // -------------------------

  const handleView = async (id) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewEnquiry(null);

    try {
      const response = await api.get(`enquiries/${id}/`);
      setViewEnquiry(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewEnquiry(null);
  };

  // -------------------------
  // CALL HISTORY
  // -------------------------

  const handleOpenCall = () => {
    setCallForm({
      call_status: "ANSWERED",
      feedback: "",
      next_follow_up_date: "",
    });

    setCallOpen(true);
  };

  const handleCloseCall = () => {
    setCallOpen(false);
  };

  const handleCallChange = (event) => {
    const { name, value } = event.target;

    setCallForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddCallHistory = async () => {
    if (!viewEnquiry) return;

    try {
      setCallLoading(true);

      await api.post("call-history/", {
        enquiry: viewEnquiry.id,
        call_status: callForm.call_status,
        feedback: callForm.feedback,
        next_follow_up_date:
          callForm.next_follow_up_date || null,
      });

      const response = await api.get(
        `enquiries/${viewEnquiry.id}/`
      );

      setViewEnquiry(response.data);

      setCallOpen(false);

      setCallForm({
        call_status: "ANSWERED",
        feedback: "",
        next_follow_up_date: "",
      });
      showSnackbar("Call history saved.");
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Failed to save call history.",
        "error"
      );
    } finally {
      setCallLoading(false);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------

  const handleDeleteOpen = (enquiry) => {
    askConfirm({
      title: "Delete Enquiry",
      message: `Delete the enquiry for "${enquiry.student_name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(enquiry),
    });
  };

  const confirmDelete = async (enquiry) => {
    try {
      await api.delete(
        `enquiries/${enquiry.id}/`
      );

      await fetchEnquiries();

      showSnackbar("Enquiry deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Failed to delete enquiry.",
        "error"
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Enquiries"
        subtitle="Manage student enquiries"
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Enquiry
          </Button>
        }
      />

      <TableCard>
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">
                    {enquiry.student_name}
                  </TableCell>

                  <TableCell>
                    {enquiry.phone}
                  </TableCell>

                  <TableCell>
                    {enquiry.college || "-"}
                  </TableCell>

                  <TableCell>
                    {enquiry.academic_stream || "-"}
                  </TableCell>

                  <TableCell>
                    {enquiry.course_name || "-"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={enquiry.enquiry_stage} />
                  </TableCell>

                  <TableCell>
                    {enquiry.responsible_person ||
                      "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="View"
                      onClick={() =>
                        handleView(
                          enquiry.id
                        )
                      }
                    >
                      <Eye />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit"
                      onClick={() =>
                        handleEdit(
                          enquiry
                        )
                      }
                    >
                      <Pencil />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() =>
                        handleDeleteOpen(
                          enquiry
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {enquiries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-5 text-center text-muted-foreground"
                  >
                    No enquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableCard>

      {/* ================= VIEW DIALOG ================= */}

      <Dialog open={viewOpen} onOpenChange={handleCloseView}>
        <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>{viewEnquiry?.student_name || "Loading…"}</DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex justify-center py-5">
              <Spinner />
            </div>
          ) : viewEnquiry ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Student Name"
                  value={viewEnquiry.student_name}
                />

                <DetailItem
                  label="Phone"
                  value={viewEnquiry.phone}
                />

                <DetailItem
                  label="College"
                  value={viewEnquiry.college}
                />

                <DetailItem
                  label="Academic Stream"
                  value={viewEnquiry.academic_stream}
                />

                <DetailItem
                  label="Interested Course"
                  value={viewEnquiry.course_name}
                />

                <DetailItem
                  label="Recommended By"
                  value={viewEnquiry.recommended_by}
                />

                <DetailItem
                  label="Enquiry Stage"
                  value={viewEnquiry.enquiry_stage}
                />

                <DetailItem
                  label="Responsible Person"
                  value={viewEnquiry.responsible_person}
                />

                <DetailItem
                  label="Enquiry Date"
                  value={viewEnquiry.enquiry_date}
                />
              </div>

              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="mt-1">{viewEnquiry.feedback || "-"}</p>
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-bold">Call History</h3>

                <Button onClick={handleOpenCall}>
                  <Plus data-icon="inline-start" />
                  Add Call History
                </Button>
              </div>

              <TableCard>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Next Follow-up</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {viewEnquiry.call_history?.map(
                      (call) => (
                        <TableRow key={call.id}>
                          <TableCell>
                            {call.call_date
                              ? new Date(
                                  call.call_date
                                ).toLocaleString()
                              : "-"}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={call.call_status} />
                          </TableCell>

                          <TableCell>
                            {call.feedback || "-"}
                          </TableCell>

                          <TableCell>
                            {call.next_follow_up_date ||
                              "-"}
                          </TableCell>
                        </TableRow>
                      )
                    )}

                    {!viewEnquiry.call_history
                      ?.length && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-3 text-center text-muted-foreground"
                        >
                          No call history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableCard>
            </>
          ) : (
            <p className="text-destructive">
              Failed to load enquiry.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseView}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= CALL HISTORY DIALOG ================= */}

      <Dialog open={callOpen} onOpenChange={handleCloseCall}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Call History</DialogTitle>
            <DialogDescription>
              Add call details for{" "}
              <strong>
                {viewEnquiry?.student_name || "Student"}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <FormSelect
            label="Call Status"
            name="call_status"
            value={callForm.call_status}
            onChange={handleCallChange}
            options={[
              { value: "ANSWERED", label: "Answered" },
              { value: "NOT_ANSWERED", label: "Not Answered" },
              { value: "BUSY", label: "Busy" },
              { value: "SWITCHED_OFF", label: "Switched Off" },
              { value: "CALL_BACK", label: "Call Back" },
            ]}
          />

          <FormField
            required
            multiline
            rows={4}
            label="Feedback"
            placeholder="Notes from the call…"
            name="feedback"
            value={callForm.feedback}
            onChange={handleCallChange}
          />

          <FormField
            type="date"
            label="Next Follow-up Date"
            name="next_follow_up_date"
            value={callForm.next_follow_up_date}
            onChange={handleCallChange}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCall}
              disabled={callLoading}
            >
              Cancel
            </Button>

            <LoadingButton
              loading={callLoading}
              onClick={handleAddCallHistory}
              disabled={!callForm.feedback.trim()}
            >
              Save Call
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= ENQUIRY FORM ================= */}

      <EnquiryForm
        open={formOpen}
        onClose={handleFormClose}
        enquiry={editingEnquiry}
        onSuccess={async () => {
          const wasEdit = Boolean(editingEnquiry);

          await fetchEnquiries();

          showSnackbar(
            wasEdit
              ? "Enquiry updated successfully."
              : "Enquiry created successfully."
          );
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

export default Enquiries;
