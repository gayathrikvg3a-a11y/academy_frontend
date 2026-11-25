import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ================= FORM FIELD =================
//
// Adapter that mirrors MUI's TextField prop surface so existing handlers
// (which read event.target.name / event.target.value) work verbatim.
// Renders a Base UI Field + Input/Textarea and calls onChange(event) natively.

function FormField({
  label,
  name,
  value,
  onChange,
  error = "",
  helperText,
  required = false,
  type = "text",
  multiline = false,
  rows,
  placeholder,
  disabled = false,
  select = false,
  ...props
}) {
  const control = multiline ? (
    <Textarea
      name={name}
      value={value ?? ""}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={!!error}
      onChange={onChange}
      {...props}
    />
  ) : (
    <Input
      name={name}
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={!!error}
      onChange={onChange}
      {...props}
    />
  );

  return (
    <Field data-invalid={!!error || undefined}>
      {label && <FieldLabel>{label}{required ? " *" : ""}</FieldLabel>}
      {control}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : helperText && String(helperText).trim() ? (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      ) : null}
    </Field>
  );
}

export default FormField;
