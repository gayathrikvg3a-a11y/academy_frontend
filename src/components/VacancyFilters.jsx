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

import { JOB_TYPE_OPTIONS } from "../utils/vacancies";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function VacancyFilters({
  filters,
  departments = [],
  onChange,
  onReset,
}) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.department !== "" ||
    filters.job_type !== "" ||
    filters.status !== "";

  // Every select carries the same "" ↔ "__all__" sentinel the rest of the
  // filter bars use: Base UI treats "" as a real value, but the page's guards
  // read "" as "no filter".
  const handleSelect = (name) => (value) =>
    onChange({
      target: { name, value: value === "__all__" ? "" : value },
    });

  return (
    <FilterBar>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search by title, department or location..."
          value={filters.search}
          onChange={onChange}
          className="pl-8"
        />
      </div>

      <Select
        name="department"
        value={filters.department === "" ? "__all__" : filters.department}
        onValueChange={handleSelect("department")}
        items={[
          { value: "__all__", label: "All Departments" },
          ...departments.map((department) => ({
            value: department,
            label: department,
          })),
        ]}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Departments</SelectItem>
          {departments.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name="job_type"
        value={filters.job_type === "" ? "__all__" : filters.job_type}
        onValueChange={handleSelect("job_type")}
        items={[
          { value: "__all__", label: "All Job Types" },
          ...JOB_TYPE_OPTIONS,
        ]}
      >
        <SelectTrigger className="min-w-[170px]">
          <SelectValue placeholder="All Job Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Job Types</SelectItem>
          {JOB_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name="status"
        value={filters.status === "" ? "__all__" : filters.status}
        onValueChange={handleSelect("status")}
        items={[
          { value: "__all__", label: "All Status" },
          ...STATUS_OPTIONS,
        ]}
      >
        <SelectTrigger className="min-w-[160px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Status</SelectItem>
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
