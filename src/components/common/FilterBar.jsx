// ================= FILTER BAR =================
//
// The row that holds a screen's search and filter controls. Matches the
// CRM's data-table-toolbar treatment: a bare flex row, no card box.
// Controls normalise to h-8 (the CRM's control height).

function FilterBar({ children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
    </div>
  );
}

export default FilterBar;
