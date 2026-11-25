import { useEffect, useRef, useState } from "react";

import { getCourses } from "../api/courseApi";
import { createWebsiteEnquiry } from "../api/websiteEnquiryApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import FormSelect from "./common/FormSelect";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  name: "",
  email: "",
  phone_number: "",
  location: "",
  course: "",
  message: "",
};

// ================= REQUIRED FIELDS =================

// The same rules as the website's form: everything but the course, which
// can be left as "Not sure yet".
const requiredFields = {
  name: "Name",
  email: "Email",
  phone_number: "Phone number",
  location: "Location",
  message: "Message",
};

// Adds an enquiry by hand, as if it had come through the website's contact
// form: for one taken over the phone or at the front desk.
function WebsiteEnquiryForm({
  open,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);

  const [courses, setCourses] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(false);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setFormData(initialForm);
    setErrors({});
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const response = await getCourses();

      setCourses(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Failed to load courses:", error);

      setErrors({
        [FORM_ERROR_KEY]: "Failed to load courses.",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

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

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});

      await createWebsiteEnquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        location: formData.location.trim(),
        course: formData.course ? Number(formData.course) : null,
        message: formData.message.trim(),
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to save enquiry:", error);

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

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Add Website Enquiry"
      subtitle="The same details the website's contact form asks for"
      submitLabel="Create Enquiry"
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= CONTACT ================= */}

        <FormSection
          title="Contact Details"
          columns={2}
        >
          <FormField
            required
            label="Name"
            placeholder="Full name"
            {...fieldProps("name")}
          />

          <FormField
            required
            type="email"
            label="Email"
            placeholder="name@example.com"
            {...fieldProps("email")}
          />

          <FormField
            required
            type="tel"
            label="Phone"
            placeholder="+91 98765 43210"
            {...fieldProps("phone_number")}
          />

          <FormField
            required
            label="Location"
            placeholder="Kozhikode"
            {...fieldProps("location")}
          />
        </FormSection>

        {/* ================= ENQUIRY ================= */}

        <FormSection
          title="Enquiry"
          columns={1}
        >
          <FormSelect
            label="Course"
            placeholder="Not sure yet"
            disabled={loadingCourses}
            options={[
              { value: "", label: "Not sure yet" },
              ...courses.map((course) => ({
                value: course.id,
                label: course.name,
              })),
            ]}
            {...fieldProps("course")}
          />

          <FormField
            required
            multiline
            label="Message"
            placeholder="What they'd like to know"
            className="min-h-28"
            {...fieldProps("message")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default WebsiteEnquiryForm;
