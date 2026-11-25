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

function BatchFilters({
  search,
  setSearch,
  course,
  setCourse,
  session,
  setSession,
  status,
  setStatus,
  courses = [],
  onClearFilters,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    course !== "" ||
    session !== "" ||
    status !== "";

  return (
    <FilterBar>
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by batch name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <SelectTrigger className="min-w-[200px]">
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

      {/* Session */}
      <Select
        value={session === "" ? "__all__" : session}
        onValueChange={(value) => setSession(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Sessions" },
          { value: "MORNING", label: "Morning" },
          { value: "EVENING", label: "Evening" },
        ]}
      >
        <SelectTrigger className="min-w-[160px]">
          <SelectValue placeholder="All Sessions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Sessions</SelectItem>
          <SelectItem value="MORNING">Morning</SelectItem>
          <SelectItem value="EVENING">Evening</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={status === "" ? "__all__" : status}
        onValueChange={(value) => setStatus(value === "__all__" ? "" : value)}
        items={[
          { value: "__all__", label: "All Status" },
          { value: "UPCOMING", label: "Upcoming" },
          { value: "ONGOING", label: "Ongoing" },
          { value: "COMPLETED", label: "Completed" },
        ]}
      >
        <SelectTrigger className="min-w-[170px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
          <SelectItem value="UPCOMING">Upcoming</SelectItem>
          <SelectItem value="ONGOING">Ongoing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
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

export default BatchFilters;
