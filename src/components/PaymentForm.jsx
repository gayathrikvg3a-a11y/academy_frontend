import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

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

// A new payment is dated today. Formatted locally rather than with
// toISOString, which is UTC and gives yesterday's date before 5:30 AM IST.
const emptyForm = () => ({
  student: "",
  amount: "",
  payment_method: "",
  payment_date: format(new Date(), "yyyy-MM-dd"),
  transaction_reference: "",
  notes: "",
});

// ================= REQUIRED FIELDS =================

const requiredFields = {
  student: "Student",
  payment_method: "Payment method",
  amount: {
    label: "Amount",
    positive: true,
  },
  payment_date: "Payment date",
};

function PaymentForm({
  open,
  onClose,
  payment,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [students, setStudents] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [errors, setErrors] = useState({});

  // ==============================
  // Load Students
  // ==============================

  const fetchStudents = async () => {
    try {
      const response = await api.get(
        "students/",
        {
          params: {
            page_size: 1000,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results;

      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==============================
  // Load Payment Methods
  // ==============================

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get(
        "payment-types/",
        {
          params: {
            data: "",
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results;

      setPaymentMethods(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==============================
  // Initial Load
  // ==============================

  const loadData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchStudents(),
        fetchPaymentMethods(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (payment) {
      setFormData({
        student: payment.student,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        transaction_reference:
          payment.transaction_reference || "",
        notes:
          payment.notes || "",
      });
    } else {
      setFormData(emptyForm());
    }

    setErrors({});
  }, [payment, open]);

  useEffect(() => {
    const student = students.find(
      (item) => item.id === formData.student
    );

    setSelectedStudent(student || null);
  }, [formData.student, students]);

  // ==============================
  // Handle Change
  // ==============================

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

  // ==============================
  // Validation
  // ==============================

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

  // ==============================
  // Submit
  // ==============================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const payload = {
        student: formData.student,
        amount: formData.amount,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        transaction_reference:
          formData.transaction_reference,
        notes: formData.notes,
      };

      if (payment) {
        await api.put(
          `payments/${payment.id}/`,
          payload
        );
      } else {
        await api.post(
          "payments/",
          payload
        );
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "Failed to save payment:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save payment."
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
      title={
        payment ? "Edit Payment" : "Add Payment"
      }
      subtitle={
        payment
          ? "Update payment details"
          : "Record a new fee payment"
      }
      submitLabel={
        payment ? "Update Payment" : "Save Payment"
      }
      onSubmit={handleSubmit}
      saving={saving}
      loading={loading}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= PAYMENT DETAILS ================= */}

        <FormSection
          title="Payment Details"
          columns={2}
        >
          <FormSelect
            required
            label="Student"
            className="sm:col-span-2"
            {...fieldProps("student")}
            placeholder="Select Student"
            options={[
              { value: "", label: "Select Student" },
              ...students.map((student) => ({
                value: student.id,
                label: `${student.student_id} - ${student.student_name}`,
              })),
            ]}
          />

          {selectedStudent && (
            <div className="rounded-lg border bg-muted/50 p-2 text-sm sm:col-span-2">
              <p>Course: {selectedStudent.course_name || "-"}</p>
              <p className="mt-0.5">
                Course Fee: ₹
                {Number(
                  selectedStudent.course_fee || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <FormSelect
            required
            label="Payment Method"
            {...fieldProps("payment_method")}
            placeholder="Select Payment Method"
            options={[
              { value: "", label: "Select Payment Method" },
              ...paymentMethods.map((method) => ({
                value: method.id,
                label: method.payment_type_name,
              })),
            ]}
          />

          <FormField
            required
            type="number"
            label="Amount"
            placeholder="50000"
            {...fieldProps("amount")}
          />

          <FormField
            required
            type="date"
            label="Payment Date"
            {...fieldProps("payment_date")}
          />

          <FormField
            label="Transaction Reference"
            placeholder="UTR / receipt number"
            {...fieldProps("transaction_reference")}
          />
        </FormSection>

        {/* ================= NOTES ================= */}

        <FormSection
          title="Notes"
          columns={1}
        >
          <FormField
            multiline
            rows={4}
            label="Notes"
            placeholder="Any additional notes…"
            {...fieldProps("notes")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default PaymentForm;
