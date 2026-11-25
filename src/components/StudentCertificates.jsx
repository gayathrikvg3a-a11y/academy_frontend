import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

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

import ConfirmDialog from "./common/ConfirmDialog";
import FormField from "./common/FormField";
import LoadingButton from "./common/LoadingButton";
import TableCard from "./common/TableCard";
import useConfirm from "./common/useConfirm";
import useSnackbar from "./common/useSnackbar";

import { clearFieldError } from "../utils/formErrors";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";

function StudentCertificates({ open, onClose, student }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [certificateTitle, setCertificateTitle] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);

  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [errors, setErrors] = useState({});

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  const fetchCertificates = async () => {
    if (!student?.id) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("student-certificates/", {
        params: {
          student: student.id,
        },
      });

      setCertificates(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch certificates:",
        error.response?.data || error
      );

      showSnackbar(
        "Failed to load certificates.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && student?.id) {
      fetchCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  const resetForm = () => {
    setCertificateTitle("");
    setCertificateNumber("");
    setIssueDate("");
    setCertificateFile(null);
    setErrors({});
  };

  // ================= VALIDATION =================
  //
  // Title and file are mandatory; both report under their own control rather
  // than in a popup.

  const validate = () => {
    const newErrors = {};

    if (!certificateTitle.trim()) {
      newErrors.certificate_title =
        "Certificate title is required.";
    }

    if (!certificateFile) {
      newErrors.certificate_file =
        "Please choose a certificate file.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!student?.id) {
      return;
    }

    if (!validate()) {
      return;
    }

    const formData = new FormData();

    formData.append("student", student.id);
    formData.append(
      "certificate_title",
      certificateTitle.trim()
    );

    if (certificateNumber.trim()) {
      formData.append(
        "certificate_number",
        certificateNumber.trim()
      );
    }

    if (issueDate) {
      formData.append("issue_date", issueDate);
    }

    formData.append(
      "certificate_file",
      certificateFile
    );

    setUploading(true);

    try {
      await api.post(
        "student-certificates/",
        formData
      );

      resetForm();

      await fetchCertificates();

      showSnackbar("Certificate uploaded successfully.");
    } catch (error) {
      console.error(
        "Failed to upload certificate:",
        error.response?.data || error
      );

      showSnackbar(
        "Failed to upload certificate.",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (certificate) => {
    askConfirm({
      title: "Delete Certificate",
      message: `Delete certificate "${certificate.certificate_title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(certificate),
    });
  };

  const confirmDelete = async (certificate) => {
    try {
      await api.delete(
        `student-certificates/${certificate.id}/`
      );

      setPreviewCertificate((previous) =>
        previous?.id === certificate.id ? null : previous
      );

      await fetchCertificates();

      showSnackbar("Certificate deleted successfully.");
    } catch (error) {
      console.error(
        "Failed to delete certificate:",
        error.response?.data || error
      );

      showSnackbar(
        "Failed to delete certificate.",
        "error"
      );
    }
  };

  // ================= PREVIEW =================
  //
  // Every row carries a thumbnail of what was uploaded, and opening one raises
  // a modal over the history rather than a new tab, so the list is still there
  // when the file is closed. PDFs need a frame and images an <img>; anything
  // the browser will not paint inline keeps only the link out to a new tab.

  const certificateSrc = (certificate) =>
    resolveMediaUrl(
      certificate.certificate_file_url,
      certificate.certificate_file
    );

  const certificateKind = (certificate) => {
    const name = mediaFileName(
      certificate.certificate_file_url,
      certificate.certificate_file
    ).toLowerCase();

    if (name.endsWith(".pdf")) {
      return "pdf";
    }

    if (/\.(png|jpe?g|gif|webp|bmp|svg|avif)$/.test(name)) {
      return "image";
    }

    return "other";
  };

  const handleView = (certificate) => {
    if (!certificateSrc(certificate)) {
      showSnackbar(
        "Certificate file not available.",
        "warning"
      );
      return;
    }

    setPreviewCertificate(certificate);
  };

  // The file lives on the API host, so a plain `download` attribute is
  // cross-origin and the browser would only navigate to it. Pulling the bytes
  // down first and saving them from a blob URL keeps it a download, and an
  // origin that refuses the fetch falls back to opening the file.

  const handleDownload = async (certificate) => {
    const src = certificateSrc(certificate);

    if (!src) {
      showSnackbar(
        "Certificate file not available.",
        "warning"
      );
      return;
    }

    const fileName =
      mediaFileName(
        certificate.certificate_file_url,
        certificate.certificate_file
      ) || certificate.certificate_title;

    setDownloading(true);

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(
        "Failed to download certificate:",
        error
      );

      window.open(src, "_blank", "noopener,noreferrer");

      showSnackbar(
        "Download blocked — opened the certificate in a new tab.",
        "warning"
      );
    } finally {
      setDownloading(false);
    }
  };

  const previewSrc = previewCertificate
    ? certificateSrc(previewCertificate)
    : "";

  const previewKind = previewCertificate
    ? certificateKind(previewCertificate)
    : "other";

  const handleClose = () => {
    resetForm();
    setCertificates([]);
    setPreviewCertificate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Student Certificates</DialogTitle>
          <DialogDescription>
            {student?.student_name || "-"} — {student?.student_id || "-"}
          </DialogDescription>
        </DialogHeader>

        <h3 className="mb-2 text-base font-semibold">Upload Certificate</h3>

        <div className="grid items-start gap-2.5 md:grid-cols-[2fr_1fr_1fr]">
          <FormField
            required
            name="certificate_title"
            label="Certificate Title"
            placeholder="Course completion certificate"
            value={certificateTitle}
            onChange={(event) => {
              setCertificateTitle(event.target.value);

              setErrors((previous) =>
                clearFieldError(
                  previous,
                  "certificate_title"
                )
              );
            }}
            error={errors.certificate_title || ""}
          />

          <FormField
            label="Certificate Number"
            placeholder="CRT-2026-0001"
            value={certificateNumber}
            onChange={(event) =>
              setCertificateNumber(event.target.value)
            }
          />

          <FormField
            type="date"
            label="Issue Date"
            value={issueDate}
            onChange={(event) =>
              setIssueDate(event.target.value)
            }
          />
        </div>

        <div className="mt-1 flex flex-wrap items-start gap-2">
          <div className="flex flex-col gap-0.5">
            <Button
              variant="outline"
              render={
                <label className={errors.certificate_file ? "border-destructive text-destructive" : undefined}>
                  Choose Certificate File
                  <input
                    hidden
                    type="file"
                    name="certificate_file"
                    accept=".pdf,image/*"
                    onChange={(event) => {
                      setCertificateFile(
                        event.target.files?.[0] || null
                      );

                      setErrors((previous) =>
                        clearFieldError(
                          previous,
                          "certificate_file"
                        )
                      );
                    }}
                  />
                </label>
              }
            />
            {errors.certificate_file && (
              <p className="text-sm text-destructive">
                {errors.certificate_file}
              </p>
            )}
          </div>

          <p className="py-1 text-sm text-muted-foreground">
            {certificateFile
              ? certificateFile.name
              : "No file selected"}
          </p>

          <div className="ml-auto">
            <LoadingButton
              loading={uploading}
              onClick={handleUpload}
            >
              Upload Certificate
            </LoadingButton>
          </div>
        </div>

        <div className="my-4 h-px bg-border" />

        <h3 className="mb-2 text-base font-semibold">Certificate History</h3>

        {loading ? (
          <div className="flex justify-center py-5">
            <Spinner />
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-center text-muted-foreground">
            No certificates uploaded for this student.
          </div>
        ) : (
          <TableCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Preview</TableHead>
                  <TableHead>Certificate Title</TableHead>
                  <TableHead>Certificate Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {certificates.map((certificate) => {
                  const fileSrc = certificateSrc(certificate);
                  const fileKind = certificateKind(certificate);

                  return (
                    <TableRow key={certificate.id}>
                      <TableCell>
                        <button
                          type="button"
                          title="View certificate"
                          onClick={() => handleView(certificate)}
                          className="flex size-12 items-center justify-center overflow-hidden rounded-md border bg-muted transition-opacity hover:opacity-80"
                        >
                          {fileKind === "image" && fileSrc ? (
                            <img
                              src={fileSrc}
                              alt={certificate.certificate_title}
                              className="size-full object-cover"
                            />
                          ) : (
                            <FileText className="size-5 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>{certificate.certificate_title}</TableCell>
                      <TableCell>{certificate.certificate_number || "-"}</TableCell>
                      <TableCell>{certificate.issue_date || "-"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(certificate)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDelete(certificate)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableCard>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>

        <Dialog
          open={Boolean(previewCertificate)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPreviewCertificate(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">
                {previewCertificate?.certificate_title || "Certificate"}
              </DialogTitle>
              <DialogDescription>
                {previewCertificate?.certificate_number || "No certificate number"}
                {previewCertificate?.issue_date
                  ? ` — ${previewCertificate.issue_date}`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            {previewCertificate && (
              previewKind === "image" ? (
                <img
                  src={previewSrc}
                  alt={previewCertificate.certificate_title}
                  className="max-h-[65svh] w-full rounded-lg bg-muted object-contain"
                />
              ) : previewKind === "pdf" ? (
                <iframe
                  src={previewSrc}
                  title={previewCertificate.certificate_title}
                  className="h-[65svh] w-full rounded-lg border bg-muted"
                />
              ) : (
                <p className="py-6 text-center text-muted-foreground">
                  This file type cannot be previewed here.
                </p>
              )
            )}

            <DialogFooter>
              <LoadingButton
                variant="outlined"
                loading={downloading}
                startIcon={<Download />}
                onClick={() => handleDownload(previewCertificate)}
              >
                Download
              </LoadingButton>
              <Button
                variant="outline"
                render={
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewCertificate(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          {...confirm}
          onConfirm={runConfirm}
          onClose={closeConfirm}
        />
</DialogContent>
    </Dialog>
  );
}

export default StudentCertificates;
