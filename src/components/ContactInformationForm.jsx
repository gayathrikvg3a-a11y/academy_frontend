import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import {
  createContactInformation,
  updateContactInformation,
} from "../api/contactInformationApi";

import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import LoadingButton from "./common/LoadingButton";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

// The form's fields, as the API names them. Blank while nothing has been
// saved yet (record is null).
const fieldsOf = (record) => ({
  contact_number: record?.contact_number || "",
  alternate_number: record?.alternate_number || "",
  whatsapp_number: record?.whatsapp_number || "",
  whatsapp_alternate: record?.whatsapp_alternate || "",
  email: record?.email || "",
  address: record?.address || "",
  maps: record?.maps || "",
});

// ================= REQUIRED FIELDS =================
//
// What the website leads with. The alternates and the map link are optional:
// the website leaves out whatever is blank.

const requiredFields = {
  contact_number: "Phone number",
  whatsapp_number: "WhatsApp number",
  email: "Email",
  address: "Address",
};

function ContactInformationForm({
  record,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(() => fieldsOf(record));

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  // Starts again from what the server has, which is re-read after each save.
  useEffect(() => {
    setFormData(fieldsOf(record));

    setErrors({});
  }, [record]);

  const saved = fieldsOf(record);

  const changed = Object.keys(saved).some(
    (name) => formData[name].trim() !== saved[name].trim()
  );

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});

      // Every field is sent: one cleared here is cleared on the website too.
      const data = Object.fromEntries(
        Object.entries(formData).map(([name, value]) => [
          name,
          value.trim(),
        ])
      );

      // The first save creates the record; after that it is only updated.
      if (record) {
        await updateContactInformation(record.id, data);
      } else {
        await createContactInformation(data);
      }

      await onSuccess();
    } catch (error) {
      console.error("Failed to save contact information:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save contact information."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  const updatedAt = record?.updated_at
    ? new Date(record.updated_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardContent className="flex flex-col gap-4">

          {errors[FORM_ERROR_KEY] && (
            <Alert variant="destructive">
              <AlertDescription>
                {errors[FORM_ERROR_KEY]}
              </AlertDescription>
            </Alert>
          )}

          <div ref={contentRef}>

            <FormSection
              title="Phone"
              description="The website's call buttons dial the phone number."
            >
              <FormField
                required
                label="Phone number"
                placeholder="+91 98765 43210"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                error={errors.contact_number || ""}
              />

              <FormField
                label="Alternate phone number"
                placeholder="+91 98765 43211"
                helperText="Optional. Listed under the phone number."
                name="alternate_number"
                value={formData.alternate_number}
                onChange={handleChange}
                error={errors.alternate_number || ""}
              />
            </FormSection>

            <FormSection
              title="WhatsApp"
              description="The website's WhatsApp buttons open a chat with the WhatsApp number."
            >
              <FormField
                required
                label="WhatsApp number"
                placeholder="+91 98765 43210"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                error={errors.whatsapp_number || ""}
              />

              <FormField
                label="Alternate WhatsApp number"
                placeholder="+91 98765 43212"
                helperText="Optional. Listed under the WhatsApp number."
                name="whatsapp_alternate"
                value={formData.whatsapp_alternate}
                onChange={handleChange}
                error={errors.whatsapp_alternate || ""}
              />
            </FormSection>

            <FormSection
              title="Email and address"
              description="Shown in the website's footer and on its contact page."
            >
              <FormField
                required
                label="Email"
                type="email"
                placeholder="info@example.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email || ""}
              />

              <FormField
                label="Map link"
                type="url"
                placeholder="https://maps.google.com/?q=..."
                helperText="Where Get directions leads. Left blank, it searches the address on Google Maps."
                name="maps"
                value={formData.maps}
                onChange={handleChange}
                error={errors.maps || ""}
              />

              <div className="sm:col-span-2">
                <FormField
                  required
                  multiline
                  rows={3}
                  label="Address"
                  placeholder="1st Floor, Kinfra Advanced Technology Park"
                  helperText="Shown in the footer as written. Put each line on its own row."
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address || ""}
                />
              </div>
            </FormSection>

          </div>
        </CardContent>

        <CardFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {updatedAt && `Last updated ${updatedAt}`}
          </p>

          <div className="flex items-center gap-2">
            {changed && (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  setFormData(fieldsOf(record));
                  setErrors({});
                }}
              >
                Undo Changes
              </Button>
            )}

            <LoadingButton
              type="submit"
              loading={saving}
              disabled={!changed}
            >
              Save Changes
            </LoadingButton>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

export default ContactInformationForm;
