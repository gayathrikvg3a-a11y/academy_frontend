import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import api from "../api/axios";

import { cn, formatINR } from "@/lib/utils";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";
import useSnackbar from "./common/useSnackbar";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

const initialFormData = {
  // ================= BASIC =================
  student_name: "",
  phone: "",
  whatsapp: "",
  email: "",
  gender: "",
  date_of_birth: "",

  // ================= ADDRESS =================
  address: "",
  district: "",
  state: "",
  pincode: "",

  // ================= ACADEMIC =================
  college: "",
  academic_stream: "",

  // ================= COURSE =================
  course: "",
  fee_type: "",
  fee_plan: "",
  course_fee: "",
  joining_date: "",
  status: "ACTIVE",

  // ================= LOGIN =================
  username: "",
  password: "",
  confirm_password: "",

  // ================= PHOTO =================
  student_photo: null,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  student_name: "Student name",
  phone: "Phone number",
  course: "Course",
  fee_type: "Fee type",
  course_fee: {
    label: "Course fee",
    positive: true,
  },
};

// Login credentials are only mandatory when creating the student; on edit an
// empty value means "leave the existing credentials alone".
const credentialFields = {
  username: "Username",
  password: "Password",
  confirm_password: "Confirm password",
};

function StudentForm({
  open,
  onClose,
  student,
  onSuccess,
}) {
  const isEdit = Boolean(student);

  const contentRef = useRef(null);

  const [formData, setFormData] =
    useState(initialFormData);

  const [courses, setCourses] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] = useState({});

  const {
    showSnackbar,
  } = useSnackbar();

  // ================= LOAD OPTIONS =================

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const [courseResponse, feeTypeResponse] =
        await Promise.all([
          api.get("courses/"),
          api.get("fee-types/"),
        ]);

      const courseData = Array.isArray(
        courseResponse.data
      )
        ? courseResponse.data
        : courseResponse.data?.results || [];

      const feeTypeData = Array.isArray(
        feeTypeResponse.data
      )
        ? feeTypeResponse.data
        : feeTypeResponse.data?.results || [];

      setCourses(courseData);
      setFeeTypes(feeTypeData);
    } catch (error) {
      console.error(
        "Failed to load student form options:",
        error
      );

      showSnackbar(
        "Failed to load courses.",
        "error"
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  // ================= COURSE DETAILS =================
  //
  // The course list embeds fee_options, but a fresh fetch of the single course
  // keeps the pricing/options current (a counsellor may have edited them since
  // the list was loaded).

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await api.get(
        `courses/${courseId}/`
      );

      setSelectedCourse(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to fetch course details:",
        error
      );

      // Fall back to the list copy so the section still renders.
      setSelectedCourse(
        courses.find(
          (course) =>
            Number(course.id) === Number(courseId)
        ) || null
      );
    }
  };

  // ================= OPEN FORM =================

  useEffect(() => {
    if (!open) return;

    fetchOptions();

    if (student) {
      setFormData({
        student_name:
          student.student_name || "",

        phone:
          student.phone || "",

        whatsapp:
          student.whatsapp || "",

        email:
          student.email || "",

        gender:
          student.gender || "",

        date_of_birth:
          student.date_of_birth || "",

        address:
          student.address || "",

        district:
          student.district || "",

        state:
          student.state || "",

        pincode:
          student.pincode || "",

        college:
          student.college || "",

        academic_stream:
          student.academic_stream || "",

        course:
          student.course || "",

        fee_type:
          student.fee_type || "",

        // The fee plan is a billing detail on the course, not stored on the
        // student; leave it unselected on edit so the saved course fee stays.
        fee_plan: "",

        course_fee:
          student.course_fee || "",

        joining_date:
          student.joining_date || "",

        status:
          student.status || "ACTIVE",

        // Login credentials are never loaded back
        username: "",
        password: "",
        confirm_password: "",

        student_photo: null,
      });

      if (student.course) {
        fetchCourseDetails(student.course);
      } else {
        setSelectedCourse(null);
      }
    } else {
      setFormData(initialFormData);
      setSelectedCourse(null);
    }

    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  // ================= HANDLE CHANGE =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  // ================= COURSE CHANGE =================
  //
  // Picking a course loads its pricing/options. The course fee is prefilled
  // from the course itself (discounted fee when one exists, else the list
  // fee) so no manual entry is needed.

  const handleCourseChange = (event) => {
    const { value } = event.target;

    if (value && value !== formData.course) {
      const course = courses.find(
        (item) => String(item.id) === String(value)
      );

      const defaultFee =
        course && Number(course.discount_fee) > 0
          ? course.discount_fee
          : course?.course_fee || "";

      setFormData((previousData) => ({
        ...previousData,
        course: value,
        fee_type: "",
        course_fee: defaultFee,
      }));

      setErrors((previousErrors) =>
        clearFieldError(
          clearFieldError(previousErrors, "course_fee"),
          "fee_type"
        )
      );
    } else {
      handleChange(event);
    }

    if (!value) {
      setSelectedCourse(null);
      return;
    }

    fetchCourseDetails(value);
  };

  // ================= FEE PLAN CHANGE =================
  //
  // A course fee plan is a billing option that decides the payable total.
  // It is distinct from the mandatory Fee Type (a fee-types/ record): the
  // plan's `fee` is the final price, and picking one sets the student's
  // course fee to it. Unselecting (value "") restores the course's default.

  const handleFeeOptionChange = (event) => {
    const { value } = event.target;

    const option = selectedCourse?.fee_options?.find(
      (item) =>
        Number(item.id) === Number(value)
    );

    const defaultFee =
      option?.fee ||
      (Number(selectedCourse?.discount_fee) > 0
        ? selectedCourse.discount_fee
        : selectedCourse?.course_fee || "");

    setFormData((previousData) => ({
      ...previousData,
      fee_plan: value,
      course_fee: defaultFee,
    }));

    setErrors((previousErrors) =>
      clearFieldError(
        clearFieldError(previousErrors, "course_fee"),
        "fee_plan"
      )
    );
  };

  // ================= FEE OPTIONS =================
  //
  // Only active options are offered at enrollment.

  const feeOptions = useMemo(() => {
    return (selectedCourse?.fee_options || []).filter(
      (option) => option.is_active !== false
    );
  }, [selectedCourse]);

  // ================= HANDLE PHOTO =================

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormData((previousData) => ({
      ...previousData,
      student_photo: file,
    }));
  };

  // ================= VALIDATION =================

  const validate = () => {
    const rules = isEdit
      ? { ...requiredFields }
      : {
          ...requiredFields,
          ...credentialFields,
        };

    const newErrors = validateRequired(
      formData,
      rules
    );

    // Passwords are optional on edit, but if one is typed the confirmation
    // still has to match.
    const passwordTouched =
      formData.password !== "" ||
      formData.confirm_password !== "";

    if (
      passwordTouched &&
      !newErrors.confirm_password &&
      formData.password !==
        formData.confirm_password
    ) {
      newErrors.confirm_password =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  // ================= SAVE STUDENT =================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const data = new FormData();

      Object.entries(formData).forEach(
        ([key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            data.append(key, value);
          }
        }
      );

      if (isEdit) {
        await api.patch(
          `students/${student.id}/`,
          data
        );
      } else {
        await api.post(
          "students/",
          data
        );
      }

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(
        "Failed to save student:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save student."
      );

      // Field errors belong under their fields; the form-level error is
      // surfaced as a toast so raw server/HTML bodies never render in the
      // dialog body.
      const formError =
        apiErrors[FORM_ERROR_KEY];

      if (formError) {
        delete apiErrors[FORM_ERROR_KEY];

        showSnackbar(formError, "error");
      }

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  // ================= FIELD PROPS =================
  //
  // Every field wires its message the same way, so a server error and a local
  // error surface identically — under the field.

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  // The billing total. When the course offers fee plans, the selected plan's
  // fee decides it; until one is picked the default is the discounted fee (or
  // the list fee when no discount exists). Without plans the manually entered
  // course fee does.
  const payableTotal = useMemo(() => {
    if (feeOptions.length > 0) {
      const option = selectedCourse?.fee_options?.find(
        (item) => String(item.id) === String(formData.fee_plan)
      );

      if (option) {
        return option.fee;
      }

      return Number(selectedCourse?.discount_fee) > 0
        ? selectedCourse.discount_fee
        : selectedCourse?.course_fee;
    }

    return formData.course_fee;
  }, [feeOptions, selectedCourse, formData.fee_plan, formData.course_fee]);

  // When editing, the saved fee_type id may not exist in the fee-types list
  // (e.g. it was removed server-side). Keep the stored name visible as a
  // fallback option so the trigger never prints a raw id.
  const feeTypeOptions = useMemo(() => {
    const options = feeTypes.map((feeType) => ({
      value: feeType.id,
      label: feeType.name,
    }));

    const savedId = formData.fee_type;

    const isKnown =
      savedId &&
      feeTypes.some(
        (feeType) => String(feeType.id) === String(savedId)
      );

    if (savedId && !isKnown && student?.fee_type_name) {
      options.unshift({
        value: savedId,
        label: `${student.fee_type_name} (saved)`,
      });
    }

    return options;
  }, [feeTypes, formData.fee_type, student?.fee_type_name]);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={
        isEdit
          ? "Edit Student"
          : "Add Student"
      }
      subtitle={
        isEdit
          ? "Update academy student information"
          : "Register a new academy student"
      }
      submitLabel={
        isEdit
          ? "Update Student"
          : "Save Student"
      }
      onSubmit={handleSubmit}
      saving={saving}
      loading={loadingOptions}
    >
      <div ref={contentRef}>

        {/* ================= BASIC INFORMATION ================= */}

        <FormSection
          title="Basic Information"
          columns={3}
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
            label="Whatsapp Number"
            placeholder="98765 43210"
            {...fieldProps("whatsapp")}
          />

          <FormField
            type="email"
            label="Email"
            placeholder="student@example.com"
            {...fieldProps("email")}
          />

          <FormSelect
            label="Gender"
            {...fieldProps("gender")}
            placeholder="Select Gender"
            options={[
              { value: "", label: "Select Gender" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
            ]}
          />

          <FormField
            type="date"
            label="Date of Birth"
            {...fieldProps("date_of_birth")}
          />
        </FormSection>

        {/* ================= ADDRESS ================= */}

        <FormSection
          title="Address"
          columns={3}
        >
          <FormField
            multiline
            rows={3}
            label="Address"
            placeholder="Street, area, city…"
            className="sm:col-span-2 lg:col-span-3"
            {...fieldProps("address")}
          />

          <FormField
            label="District"
            placeholder="District name"
            {...fieldProps("district")}
          />

          <FormField
            label="State"
            placeholder="State name"
            {...fieldProps("state")}
          />

          <FormField
            label="Pincode"
            placeholder="600001"
            {...fieldProps("pincode")}
          />
        </FormSection>

        {/* ================= ACADEMIC INFORMATION ================= */}

        <FormSection
          title="Academic Information"
          columns={2}
        >
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

        {/* ================= COURSE INFORMATION ================= */}

        <FormSection
          title="Course Information"
          columns={1}
        >
          <FormSelect
            required
            label="Course"
            {...fieldProps("course")}
            placeholder="Select Course"
            onChange={handleCourseChange}
            options={[
              { value: "", label: "Select Course" },
              ...courses.map((course) => ({
                value: course.id,
                label: course.name,
              })),
            ]}
          />

          {/* Fee type is mandatory and independent of any course fee plans */}
          <FormSelect
            required
            label="Fee Type"
            {...fieldProps("fee_type")}
            placeholder="Select Fee Type"
            options={[
              { value: "", label: "Select Fee Type" },
              ...feeTypeOptions,
            ]}
          />

          {/* ---------- BILLING SUMMARY ---------- */}
          {/*
            A receipt for the chosen course: the list fee, the discount (when
            one exists), and the payable total. Fee options — if the course
            has any — are the selectable plans that decide the total.
          */}

          {selectedCourse && (
            <div className="overflow-hidden rounded-lg border">
              {/* Receipt header */}
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
                <span className="text-sm font-medium">{selectedCourse.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedCourse.course_code || "—"} ·{" "}
                  {selectedCourse.duration_display ||
                    `${selectedCourse.duration || 0} ${
                      selectedCourse.duration_type || ""
                    }`}
                </span>
              </div>

              {/* Receipt body */}
              <div className="flex flex-col gap-2.5 px-4 py-3.5">
                {/* List fee */}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">
                    Course fee
                  </span>
                  <span className="mx-1 flex-1 border-b border-dotted border-border" />
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      Number(selectedCourse.discount_fee) > 0 &&
                        "text-muted-foreground line-through"
                    )}
                  >
                    {formatINR(selectedCourse.course_fee)}
                  </span>
                </div>

                {/* Discount */}
                {Number(selectedCourse.discount_fee) > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">
                      Discount fee
                    </span>
                    <span className="mx-1 flex-1 border-b border-dotted border-border" />
                    <span className="text-sm font-medium text-success tabular-nums">
                      {formatINR(selectedCourse.discount_fee)}
                    </span>
                  </div>
                )}

                {/* Fee options — the plan that sets the payable total */}
                {feeOptions.length > 0 && (
                  <FormSelect
                    label="Fee plan"
                    {...fieldProps("fee_plan")}
                    placeholder="No plan selected"
                    onChange={handleFeeOptionChange}
                    options={[
                      { value: "", label: "No plan selected" },
                      ...feeOptions.map((option) => ({
                        value: option.id,
                        label: `${option.option_name} — ${formatINR(option.fee)}`,
                      })),
                    ]}
                  />
                )}

                {/* Total payable */}
                <div className="mt-1 flex items-baseline gap-2 border-t pt-3">
                  <span className="text-sm font-semibold">
                    Total payable
                  </span>
                  <span className="mx-1 flex-1 border-b border-dotted border-border" />
                  <span className="text-lg font-bold tabular-nums">
                    {payableTotal
                      ? formatINR(payableTotal)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Joining date and status stay in a compact grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              type="date"
              label="Joining Date"
              {...fieldProps("joining_date")}
            />

            <FormSelect
              label="Status"
              {...fieldProps("status")}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "COMPLETED", label: "Completed" },
                { value: "DROPPED", label: "Dropped" },
              ]}
            />
          </div>
        </FormSection>

        {/* ================= LOGIN CREDENTIALS ================= */}

        <FormSection
          title="Student Login Credentials"
          description={
            isEdit
              ? "Leave these blank to keep the existing credentials."
              : "These credentials let the student sign in."
          }
          columns={3}
        >
          <FormField
            required={!isEdit}
            label="Username"
            placeholder="e.g. john.doe"
            {...fieldProps("username")}
            helperText={
              isEdit
                ? "Leave empty to keep existing username."
                : "This username will be used to log in."
            }
          />

          <FormField
            required={!isEdit}
            type="password"
            label="Password"
            placeholder="Enter a secure password"
            {...fieldProps("password")}
            helperText={
              isEdit
                ? "Leave blank to keep current password."
                : "Enter a secure password."
            }
          />

          <FormField
            required={!isEdit}
            type="password"
            label="Confirm Password"
            placeholder="Re-enter the password"
            {...fieldProps("confirm_password")}
          />
        </FormSection>

        {/* ================= STUDENT PHOTO ================= */}

        <FormSection
          title="Student Photo"
          columns={1}
        >
          <div>
            <Button
              variant="outline"
              render={
                <label>
                  {formData.student_photo
                    ? "Change Photo"
                    : "Upload Student Photo"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              }
            />

            {formData.student_photo && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.student_photo.name}
              </p>
            )}
          </div>
        </FormSection>

      </div>
</FormDialog>
  );
}

export default StudentForm;
