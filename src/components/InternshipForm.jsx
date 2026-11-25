import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  createInternshipStudent,
  updateInternshipStudent,
} from "../api/internshipApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  student_name: "",
  phone: "",
  email: "",
  college: "",
  academic_stream: "",
  internship_title: "",
  start_date: "",
  end_date: "",
  fee: "",
  status: "ACTIVE",
  remarks: "",
  certificate: null,
  is_active: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  student_name: "Student name",
  phone: "Phone number",
  internship_title: "Internship title",
};

export default function InternshipForm({
  open,
  student,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        certificate: null,
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [student, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      certificate: e.target.files?.[0] || null,
    }));
  };

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date < formData.start_date
    ) {
      newErrors.end_date =
        "End date must be on or after the start date.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          data.append(key, formData[key]);
        }
      });

      if (student) {
        await updateInternshipStudent(
          student.id,
          data
        );
      } else {
        await createInternshipStudent(data);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        "Failed to save internship student:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save internship student."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: formData[name] ?? "",
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={
        student
          ? "Edit Internship Student"
          : "Add Internship Student"
      }
      subtitle={
        student
          ? "Update internship student information"
          : "Register a new internship student"
      }
      submitLabel={
        student ? "Update Student" : "Save Student"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= STUDENT DETAILS ================= */}

        <FormSection
          title="Student Details"
          columns={2}
        >
          <FormField
            required
            label="Student Name"
            placeholder="Full name of the student"
            {...fieldProps("student_name")}
          />

          <FormField
            required
            label="Phone"
            placeholder="98765 43210"
            {...fieldProps("phone")}
          />

          <FormField
            type="email"
            label="Email"
            placeholder="student@example.com"
            {...fieldProps("email")}
          />

          <FormField
            label="College"
            placeholder="College name"
            {...fieldProps("college")}
          />

          <FormField
            label="Academic Stream"
            placeholder="B.Sc Computer Science"
            {...fieldProps("academic_stream")}
          />
        </FormSection>

        {/* ================= INTERNSHIP ================= */}

        <FormSection
          title="Internship"
          columns={2}
        >
          <FormField
            required
            label="Internship Title"
            placeholder="Full Stack Development Intern"
            className="sm:col-span-2"
            {...fieldProps("internship_title")}
          />

          <FormField
            type="date"
            label="Start Date"
            {...fieldProps("start_date")}
          />

          <FormField
            type="date"
            label="End Date"
            {...fieldProps("end_date")}
          />

          <FormField
            type="number"
            label="Fee"
            placeholder="5000"
            {...fieldProps("fee")}
          />

          <FormSelect
            label="Status"
            {...fieldProps("status")}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        </FormSection>

        {/* ================= REMARKS ================= */}

        <FormSection
          title="Remarks & Certificate"
          columns={1}
        >
          <FormField
            multiline
            rows={3}
            label="Remarks"
            placeholder="Notes about the internship…"
            {...fieldProps("remarks")}
          />

          <div>
            <Button
              variant="outline"
              render={
                <label>
                  {formData.certificate
                    ? "Change Certificate"
                    : "Upload Certificate"}

                  <input
                    hidden
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              }
            />

            {formData.certificate && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.certificate.name}
              </p>
            )}
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}
