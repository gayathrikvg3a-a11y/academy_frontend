import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import useSnackbar from "./common/useSnackbar";

import {
  createCourseFeeOption,
  deleteCourseFeeOption,
  getCourseFeeOptions,
  updateCourseFeeOption,
} from "../api/courseApi";

import {
  clearFieldError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

// ================= COURSE FEE OPTIONS =================
//
// The discount tiers a counsellor can pick at enrollment, each an
// { option_name, fee } pair. Unlike the rest of the course form these do not
// ride along with the course save — every row owns its own Save button and
// posts to /courses/<id>/fee-options/ on its own. That is why the section only
// appears when editing: a course has to exist before anything can be nested
// under it.

let nextKey = 0;

const makeRow = (option = null) => ({
  key: `fee-option-${(nextKey += 1)}`,
  id: option?.id ?? null,
  option_name: option?.option_name ?? "",
  fee: option?.fee ?? "",
  saving: false,
  // Rows loaded from the server start clean; a row the user just added has
  // nothing behind it yet, so it is dirty from birth.
  dirty: !option,
  errors: {},
});

const requiredFields = {
  option_name: "Discount name",
  fee: {
    label: "Discount fee",
    positive: true,
  },
};

function CourseFeeOptions({ courseId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (!courseId) return undefined;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await getCourseFeeOptions(courseId);

        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        if (!cancelled) {
          setRows(list.map((option) => makeRow(option)));
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setLoadError("Failed to load discounts.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const patchRow = (key, patch) => {
    setRows((previous) =>
      previous.map((row) =>
        row.key === key ? { ...row, ...patch } : row
      )
    );
  };

  const handleChange = (key) => (e) => {
    const { name, value } = e.target;

    setRows((previous) =>
      previous.map((row) =>
        row.key === key
          ? {
              ...row,
              [name]: value,
              dirty: true,
              errors: clearFieldError(row.errors, name),
            }
          : row
      )
    );
  };

  const handleAdd = () => {
    setRows((previous) => [...previous, makeRow()]);
  };

  const handleSave = async (key) => {
    const row = rows.find((item) => item.key === key);

    if (!row) return;

    const errors = validateRequired(row, requiredFields);

    if (Object.keys(errors).length > 0) {
      patchRow(key, { errors });
      return;
    }

    const payload = {
      option_name: row.option_name.trim(),
      fee: Number(row.fee).toFixed(2),
    };

    patchRow(key, { saving: true, errors: {} });

    try {
      const response = row.id
        ? await updateCourseFeeOption(courseId, row.id, payload)
        : await createCourseFeeOption(courseId, payload);

      patchRow(key, {
        id: response.data?.id ?? row.id,
        option_name: response.data?.option_name ?? payload.option_name,
        fee: response.data?.fee ?? payload.fee,
        saving: false,
        dirty: false,
        errors: {},
      });

      showSnackbar(
        row.id
          ? "Discount updated."
          : "Discount added."
      );
    } catch (error) {
      console.error(error);

      patchRow(key, {
        saving: false,
        errors: normalizeApiErrors(
          error,
          "Failed to save discount."
        ),
      });
    }
  };

  const handleRemove = async (key) => {
    const row = rows.find((item) => item.key === key);

    if (!row) return;

    // Never saved — there is nothing on the server to delete.
    if (!row.id) {
      setRows((previous) =>
        previous.filter((item) => item.key !== key)
      );
      return;
    }

    patchRow(key, { saving: true, errors: {} });

    try {
      await deleteCourseFeeOption(courseId, row.id);

      setRows((previous) =>
        previous.filter((item) => item.key !== key)
      );

      showSnackbar("Discount removed.");
    } catch (error) {
      console.error(error);

      patchRow(key, {
        saving: false,
        errors: normalizeApiErrors(
          error,
          "Failed to remove discount."
        ),
      });
    }
  };

  return (
    <FormSection
      title="Discounts"
      description="Multiple discount tiers a counsellor can pick at enrollment."
      columns={1}
      action={
        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={loading}
        >
          <Plus data-icon="inline-start" />
          Add discount
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-3">

          {loadError && (
            <p className="text-sm text-destructive">{loadError}</p>
          )}

          {!loadError && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No discounts yet. Add one to offer this course at a reduced fee.
            </p>
          )}

          {rows.map((row) => (
            <div key={row.key} className="rounded-lg border p-4">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Name"
                    name="option_name"
                    placeholder="Job Linked"
                    value={row.option_name}
                    onChange={handleChange(row.key)}
                    error={row.errors.option_name || ""}
                    disabled={row.saving}
                  />

                  <FormField
                    type="number"
                    label="Fee"
                    name="fee"
                    placeholder="35000.00"
                    value={row.fee}
                    onChange={handleChange(row.key)}
                    error={row.errors.fee || ""}
                    disabled={row.saving}
                  />
                </div>

                {/* mt-7 clears the field label (text-sm + Field's gap-2) so the
                    controls line up with the inputs, not their labels. */}
                <div className="flex items-center gap-1.5 sm:mt-7">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(row.key)}
                    disabled={row.saving || !row.dirty}
                  >
                    {row.saving && <Spinner data-icon="inline-start" />}
                    {row.dirty ? "Save" : "Saved"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove discount"
                    onClick={() => handleRemove(row.key)}
                    disabled={row.saving}
                  >
                    <X />
                  </Button>
                </div>
              </div>

              {row.errors[FORM_ERROR_KEY] && (
                <p className="mt-3 text-sm text-destructive">
                  {row.errors[FORM_ERROR_KEY]}
                </p>
              )}

            </div>
          ))}

        </div>
      )}
    </FormSection>
  );
}

export default CourseFeeOptions;
