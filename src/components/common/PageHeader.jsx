import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// ================= PAGE HEADER =================
//
// The single header treatment for every page: an optional back link, title,
// supporting line, an optional row of status chips, and one primary action on
// the right. Pages should not roll their own.

function PageHeader({
  title,
  subtitle,
  meta,
  back,
  action,
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        {back && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 w-fit text-muted-foreground hover:text-foreground"
            onClick={back.onClick}
          >
            <ArrowLeft data-icon="inline-start" />
            {back.label}
          </Button>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {meta && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{meta}</div>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export default PageHeader;
