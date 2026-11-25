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

function PaymentFilters({
  search,
  setSearch,
  paymentMethod,
  setPaymentMethod,
  paymentDate,
  setPaymentDate,
  paymentMethods = [],
  onClearFilters,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    paymentMethod !== "" ||
    paymentDate !== "";

  return (
    <FilterBar>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by receipt number or student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={paymentMethod === "" ? "__all__" : String(paymentMethod)}
        onValueChange={(value) =>
          setPaymentMethod(value === "__all__" ? "" : value)
        }
        items={[
          { value: "__all__", label: "All Methods" },
          ...paymentMethods.map((method) => ({
            value: String(method.id),
            label: method.name,
          })),
        ]}
      >
        <SelectTrigger className="min-w-[190px]">
          <SelectValue placeholder="All Methods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Methods</SelectItem>
          {paymentMethods.map((method) => (
            <SelectItem key={method.id} value={String(method.id)}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
        className="h-8 w-[190px]"
      />

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

export default PaymentFilters;
