import { Search, FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FilterBar from "./common/FilterBar";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "IMPORTANT", label: "Important" },
];

export default function AnnouncementFilters({
  filters,
  onChange,
  onReset,
}) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "";

  // The same "" ↔ "__all__" sentinel the other filter bars use: Base UI
  // treats "" as a real value, but the page reads "" as "no filter".
  const handleStatus = (value) =>
    onChange({
      target: { name: "status", value: value === "__all__" ? "" : value },
    });

  return (
    <FilterBar>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={onChange}
          className="pl-8"
        />
      </div>

      <Select
        name="status"
        value={filters.status === "" ? "__all__" : filters.status}
        onValueChange={handleStatus}
        items={[
          { value: "__all__", label: "All Announcements" },
          ...STATUS_OPTIONS,
        ]}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="All Announcements" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Announcements</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        <FilterX data-icon="inline-start" />
        Clear
      </Button>
    </FilterBar>
  );
}
