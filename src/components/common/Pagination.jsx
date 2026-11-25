import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// ================= PAGINATION =================
//
// Previous / Next for a DRF-paginated list. Driven by the response's own
// `next` and `previous` links rather than a page size worked out here, so it
// stays right whatever page size the endpoint uses.

function Pagination({
  page,
  setPage,
  hasPrevious,
  hasNext,
  summary,
}) {
  if (!hasPrevious && !hasNext) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>{summary}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft data-icon="inline-start" /> Previous
        </Button>
        <span className="px-2 tabular-nums">
          Page {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => setPage(page + 1)}
        >
          Next <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
