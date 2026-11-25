import { Check, Minus } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { seoFields } from "../../utils/seo";

// ================= SEO METER =================
//
// How many of an item's five SEO fields are filled in, as a bar of five cells
// and a count such as 4/5. The cells take the item's tone: red with fewer
// than half set, amber from half, green once all five are. Hovering or
// focusing it lists which fields are set; clicking it opens the SEO details.
//
// The cells fill in from the left when it appears, and a full bar closes its
// gaps into one (see .seo-meter-* in index.css). `delay`, in ms, lets a table
// fill the column row by row. Without motion it shows its final state.

const TONE_FILL = {
  destructive: "bg-destructive",
  warning: "bg-warning",
  success: "bg-success",
};

const toneOf = (filled, total) =>
  filled === total
    ? "success"
    : filled >= total / 2
      ? "warning"
      : "destructive";

function SeoMeter({ item, delay = 0, onOpen }) {
  const fields = seoFields(item);
  const total = fields.length;
  const filled = fields.filter((field) => field.set).length;
  const complete = filled === total;
  const missing = fields.filter((field) => !field.set);

  const label =
    `SEO ${filled} of ${total} filled in` +
    (missing.length > 0
      ? `, missing ${missing.map((field) => field.label).join(", ")}`
      : "") +
    ". Open SEO details.";

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label}
        onClick={() => onOpen?.(item)}
        style={{ "--seo-delay": `${delay}ms` }}
        className="inline-flex items-center gap-2.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          aria-hidden
          className={cn(
            "flex h-1.5 overflow-hidden rounded-full",
            complete ? "seo-meter-complete gap-0" : "gap-0.5"
          )}
        >
          {fields.map((field, index) => (
            <span
              key={field.key}
              className="relative w-2.5 overflow-hidden bg-foreground/10"
            >
              {index < filled && (
                <span
                  className={cn(
                    "seo-meter-fill absolute inset-0",
                    TONE_FILL[toneOf(filled, total)]
                  )}
                  style={{ "--seo-step": index }}
                />
              )}
            </span>
          ))}
        </span>

        <span
          aria-hidden
          className="seo-meter-count text-sm tabular-nums"
        >
          <span className="font-medium text-foreground">{filled}</span>
          <span className="text-muted-foreground">/{total}</span>
        </span>
      </TooltipTrigger>

      <TooltipContent className="flex-col items-stretch gap-1.5 px-3 py-2">
        <p className="font-medium">
          {complete
            ? "All SEO fields filled in"
            : `${filled} of ${total} SEO fields filled in`}
        </p>

        <ul className="flex flex-col gap-1">
          {fields.map((field) => (
            <li
              key={field.key}
              className={cn(
                "flex items-center gap-1.5",
                !field.set && "text-background/60"
              )}
            >
              {field.set ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Minus className="size-3.5" />
              )}
              {field.label}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

export default SeoMeter;
