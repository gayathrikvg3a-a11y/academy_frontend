import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function StudentPagination({
  page,
  setPage,
  totalStudents,
  pageSize,
}) {
  const totalPages = Math.ceil(totalStudents / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const from = totalStudents === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalStudents);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {from}–{to} of {totalStudents} students
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft data-icon="inline-start" /> Previous
        </Button>
        <span className="px-2 tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

export default StudentPagination;
