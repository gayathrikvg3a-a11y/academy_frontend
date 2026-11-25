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

function StudentFilters({
  search,
  setSearch,
  courses = [],
  batches = [],
  course,
  setCourse,
  batch,
  setBatch,
  status,
  setStatus,
  onClearFilters,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    course !== "" ||
    batch !== "" ||
    status !== "";

  return (
    <FilterBar>
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, student ID, phone or college..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-8"
        />
      </div>

      {/* Course */}
      <Select
        value={course === "" ? "__all__" : course}
        onValueChange={(value) => setCourse(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Courses" },
          ...courses.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        ]}
      >
        <SelectTrigger className="min-w-[190px]">
          <SelectValue placeholder="All Courses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Courses</SelectItem>
          {courses.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Batch */}
      <Select
        value={batch === "" ? "__all__" : batch}
        onValueChange={(value) => setBatch(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Batches" },
          ...batches.map((item) => ({
            value: String(item.id),
            label: item.batch_name,
          })),
        ]}
      >
        <SelectTrigger className="min-w-[190px]">
          <SelectValue placeholder="All Batches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Batches</SelectItem>
          {batches.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.batch_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={status === "" ? "__all__" : status}
        onValueChange={(value) => setStatus(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Status" },
          { value: "ACTIVE", label: "Active" },
          { value: "COMPLETED", label: "Completed" },
          { value: "DROPPED", label: "Dropped" },
          { value: "ON_HOLD", label: "On Hold" },
        ]}
      >
        <SelectTrigger className="min-w-[170px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="DROPPED">Dropped</SelectItem>
          <SelectItem value="ON_HOLD">On Hold</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
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

export default StudentFilters;
