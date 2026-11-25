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

import { DOMAIN_OPTIONS, ROLE_OPTIONS } from "../utils/staff";

export default function StaffFilters({
  filters,
  onChange,
  onReset,
}) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.role !== "" ||
    filters.domain !== "";

  // Every select carries the same "" ↔ "__all__" sentinel the rest of the
  // filter bars use: Base UI treats "" as a real value, but the page reads ""
  // as "no filter".
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
          placeholder="Search by name, email, phone or username..."
          value={filters.search}
          onChange={onChange}
          className="pl-8"
        />
      </div>

      <Select
        name="role"
        value={filters.role === "" ? "__all__" : filters.role}
        onValueChange={handleSelect("role")}
        items={[
          { value: "__all__", label: "All Roles" },
          ...ROLE_OPTIONS,
        ]}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Roles</SelectItem>
          {ROLE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name="domain"
        value={filters.domain === "" ? "__all__" : filters.domain}
        onValueChange={handleSelect("domain")}
        items={[
          { value: "__all__", label: "All Domains" },
          ...DOMAIN_OPTIONS,
        ]}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="All Domains" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Domains</SelectItem>
          {DOMAIN_OPTIONS.map((option) => (
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
