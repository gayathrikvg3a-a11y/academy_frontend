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

function CourseFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
  status,
  setStatus,
  onClearFilters,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "" ||
    status !== "";

  return (
    <FilterBar>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by course name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={category === "" ? "__all__" : category}
        onValueChange={(value) => setCategory(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Categories" },
          ...categories.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        ]}
      >
        <SelectTrigger className="min-w-[190px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Categories</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status === "" ? "__all__" : status}
        onValueChange={(value) => setStatus(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Status" },
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ]}
      >
        <SelectTrigger className="min-w-[170px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
      >
        <FilterX data-icon="inline-start" />
        Clear
      </Button>
    </FilterBar>
  );
}

export default CourseFilters;
