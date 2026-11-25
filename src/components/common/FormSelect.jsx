import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ================= FORM SELECT =================
//
// Adapter that mirrors MUI's TextField select surface. Synthesises
// onChange({ target: { name, value } }) so existing handlers work verbatim.
//
// The `"" ↔ "__all__"` sentinel is handled once here: every filter bar uses
// `""` for "All X", but Base UI treats `""` as a real value and would render
// an empty-labelled item. The sentinel keeps `""` in state so the existing
// `params.course !== ""` guards stay correct.
//
// IMPORTANT: the value handed to Base UI must ALWAYS match a rendered item,
// or SelectValue falls back to printing the raw value (e.g. "__all__") in the
// trigger. So option values are sentinel-mapped too, and a "__all__" item is
// always rendered with the placeholder label.

function FormSelect({
  label,
  name,
  value = "",
  onChange,
  options = [],
  error = "",
  placeholder = "Select…",
  disabled = false,
  required = false,
  ...props
}) {
  const sentinel = (v) => (v === "__all__" ? "" : v);
  const unsentinel = (v) => (v === "" ? "__all__" : v);

  const handleChange = (next) => {
    onChange({
      target: {
        name,
        value: sentinel(next),
      },
    });
  };

  const current = unsentinel(value ?? "");
  const hasEmptyOption = options.some(
    (option) => option.value === "" || option.value === "__all__"
  );
  // Only inject the sentinel item when the caller did not already provide an
  // empty option ("Select X") — otherwise two "__all__" items would collide.
  // Keep it mounted after a pick: if it unmounts, Base UI re-indexes the
  // remaining items and, mid-shuffle, can't find the picked value among them,
  // so it resets the selection to null (the first pick never sticks).
  const showSentinelItem = !hasEmptyOption;

  // Base UI's SelectValue resolves the trigger label from the `items` prop.
  // Without it, a value with no matching rendered item (or an id-keyed list)
  // falls back to printing the raw value. Map option values through the
  // sentinel and stringify so the lookup always hits.
  const items = [
    ...(showSentinelItem
      ? [{ value: "__all__", label: placeholder }]
      : []),
    ...options.map((option) => ({
      value: String(unsentinel(option.value)),
      label: option.label,
    })),
  ];

  return (
    <Field data-invalid={!!error || undefined}>
      {label && <FieldLabel>{label}{required ? " *" : ""}</FieldLabel>}
      <Select
        name={name}
        value={String(current)}
        onValueChange={handleChange}
        disabled={disabled}
        items={items}
        {...props}
      >
        <SelectTrigger aria-invalid={!!error} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {showSentinelItem && (
            <SelectItem value="__all__">{placeholder}</SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={unsentinel(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

export default FormSelect;
