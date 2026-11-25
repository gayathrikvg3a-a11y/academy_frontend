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

export default function InternshipFilters({
  filters,
  onChange,
  onReset,
}) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "";

  return (
    <FilterBar>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search by name, internship ID, phone or college..."
          value={filters.search}
          onChange={onChange}
          className="pl-8"
        />
      </div>

      <Select
        name="status"
        value={filters.status === "" ? "__all__" : filters.status}
        onValueChange={(value) =>
          onChange({
            target: { name: "status", value: value === "__all__" ? "" : value },
          })
        }
        items={[
          { value: "__all__", label: "All Status" },
          { value: "ACTIVE", label: "Active" },
          { value: "COMPLETED", label: "Completed" },
          { value: "CANCELLED", label: "Cancelled" },
        ]}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
