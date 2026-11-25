import { useEffect, useRef, useState } from "react";

import api from "../api/axios";

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
  college: "",
  academic_stream: "",
  recommended_by: "",
  enquiry_stage: "NEW",
  feedback: "",
  course: "",
  responsible_person: "",
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  student_name: "Student name",
  phone: "Phone number",
  course: "Interested course",
};

function EnquiryForm({
  open,
  onClose,
  enquiry,
  onSuccess,
}) {
  const isEdit = Boolean(enquiry);

  const contentRef = useRef(null);

  const [form, setForm] = useState(initialForm);

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    fetchOptions();

    if (enquiry) {
      setForm({
        student_name:
          enquiry.student_name || "",

        phone:
          enquiry.phone || "",

        college:
          enquiry.college || "",

        academic_stream:
          enquiry.academic_stream || "",

        recommended_by:
          enquiry.recommended_by || "",

        enquiry_stage:
          enquiry.enquiry_stage || "NEW",

        feedback:
          enquiry.feedback || "",

        course:
          enquiry.course || "",

        responsible_person:
          enquiry.responsible_person || "",
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enquiry]);

  // ================= LOAD DROPDOWNS =================

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const [
        coursesResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("courses/"),
        api.get("users/"),
      ]);

      setCourses(coursesResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error(
        "Failed to load enquiry form options:",
        error
      );

      setErrors({
        [FORM_ERROR_KEY]:
          "Failed to load courses or users.",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  // ================= VALIDATION =================

  const validate = () => {
    const newErrors = validateRequired(
      form,
      requiredFields
    );

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  // ================= SAVE ENQUIRY =================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const payload = {
        ...form,
        course: form.course || null,
        responsible_person:
          form.responsible_person || null,
      };

      if (isEdit) {
        await api.patch(
          `enquiries/${enquiry.id}/`,
          payload
        );
      } else {
        await api.post(
          "enquiries/",
          payload
        );
      }

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(
        "Failed to save enquiry:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save enquiry."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  // ================= FIELD PROPS =================

  const fieldProps = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={
        isEdit
          ? "Edit Enquiry"
          : "Add Enquiry"
      }
      subtitle={
        isEdit
          ? "Update enquiry information"
          : "Create a new student enquiry"
      }
      submitLabel={
        isEdit
          ? "Update Enquiry"
          : "Save Enquiry"
      }
      onSubmit={handleSubmit}
      saving={saving}
      loading={loadingOptions}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= ENQUIRY INFORMATION ================= */}

        <FormSection
          title="Enquiry Information"
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
            label="Phone Number"
            placeholder="98765 43210"
            {...fieldProps("phone")}
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

          <FormSelect
            required
            label="Interested Course"
            {...fieldProps("course")}
            placeholder="Select Course"
            options={[
              { value: "", label: "Select Course" },
              ...courses.map((course) => ({
                value: course.id,
                label: course.name,
              })),
            ]}
          />

          <FormSelect
            label="Responsible Person"
            {...fieldProps("responsible_person")}
            placeholder="Select User"
            options={[
              { value: "", label: "Select User" },
              ...users.map((user) => ({
                value: user.id,
                label: user.full_name,
              })),
            ]}
          />

          <FormSelect
            label="Enquiry Stage"
            {...fieldProps("enquiry_stage")}
            options={[
              { value: "NEW", label: "New" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "INTERESTED", label: "Interested" },
              { value: "NOT_INTERESTED", label: "Not Interested" },
              { value: "CONVERTED", label: "Converted" },
            ]}
          />

          <FormField
            label="Recommended By"
            placeholder="Student / staff name"
            {...fieldProps("recommended_by")}
          />
        </FormSection>

        {/* ================= FEEDBACK ================= */}

        <FormSection
          title="Feedback"
          columns={1}
        >
          <FormField
            multiline
            rows={5}
            label="Feedback"
            placeholder="Notes from the conversation…"
            {...fieldProps("feedback")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default EnquiryForm;
