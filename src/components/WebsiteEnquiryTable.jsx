import { ChevronDown, Eye, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/lib/utils";

import {
  enquiryInterest,
  enquiryResponsible,
  enquiryStatusLabel,
  enquiryStatusTone,
  WEBSITE_ENQUIRY_STATUSES,
} from "../utils/websiteEnquiries";

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

// Each enquiry's status is a menu: picking another sets it straight away.
// `updatingStatus` is the id of the enquiry whose status is being saved.
function WebsiteEnquiryTable({
  enquiries,
  users,
  onView,
  onEdit,
  onStatusChange,
  updatingStatus,
}) {
  return (
    <TableCard>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Received</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsible</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {enquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-5 text-center text-muted-foreground">
                No website enquiries yet.
              </TableCell>
            </TableRow>
          ) : (
            enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>

                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(enquiry.created_at)}
                </TableCell>

                <TableCell className="font-medium">
                  {enquiry.name}
                </TableCell>

                <TableCell>
                  <div>{enquiry.email}</div>
                  <div className="text-muted-foreground">{enquiry.phone_number}</div>
                </TableCell>

                <TableCell>
                  {enquiry.location || "-"}
                </TableCell>

                {/* "Internship" for an internship; the course, or "Not sure yet", for a course. */}
                <TableCell className={enquiry.course || enquiry.enquiry_type === "INTERNSHIP" ? undefined : "text-muted-foreground"}>
                  {enquiryInterest(enquiry)}
                </TableCell>

                {/* Two lines at most here; View shows the whole message. */}
                <TableCell className="max-w-xs whitespace-normal">
                  <p className="line-clamp-2">
                    {enquiry.message || "-"}
                  </p>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto gap-1 px-1 py-0.5"
                          disabled={updatingStatus === enquiry.id}
                        />
                      }
                    >
                      <StatusBadge
                        status={enquiry.status}
                        label={enquiryStatusLabel(enquiry.status)}
                        tone={enquiryStatusTone(enquiry.status)}
                      />
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                      <span className="sr-only">Change status</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={enquiry.status}
                        onValueChange={(status) => {
                          if (status !== enquiry.status) onStatusChange(enquiry, status);
                        }}
                      >
                        {WEBSITE_ENQUIRY_STATUSES.map((status) => (
                          <DropdownMenuRadioItem key={status.value} value={status.value} closeOnClick>
                            {status.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                <TableCell className={enquiry.responsible_person ? undefined : "text-muted-foreground"}>
                  {enquiryResponsible(enquiry, users) || "-"}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="View"
                    onClick={() => onView(enquiry)}
                  >
                    <Eye />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Update"
                    onClick={() => onEdit(enquiry)}
                  >
                    <Pencil />
                  </Button>
                </TableCell>

              </TableRow>
            ))
          )}

        </TableBody>

      </Table>

    </TableCard>
  );
}

export default WebsiteEnquiryTable;
