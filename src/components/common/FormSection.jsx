// ================= FORM SECTION =================
//
// A titled group of fields inside a form dialog. Lays its children out on a
// CSS grid rather than MUI's Grid, so fields never need per-field width props
// and there is no Grid API version to keep straight.
//
//   <FormSection title="Basic Information" columns={3}>
//     <FormField ... />
//     <FormField ... />
//   </FormSection>
//
// A child spans the full row with className="sm:col-span-2 lg:col-span-3".
//
// `action` places a control (usually an "Add …" button) opposite the title.
//
// Sections separate themselves: every section after the first draws its own
// rule and spacing, so forms never place dividers by hand.

function FormSection({
  title,
  description,
  action,
  columns = 2,
  children,
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="[&+&]:mt-6 [&+&]:border-t [&+&]:pt-6">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}

            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {action}
        </div>
      )}

      <div className={`grid gap-5 items-start ${gridCols[columns] || gridCols[2]}`}>
        {children}
      </div>
    </section>
  );
}

export default FormSection;
