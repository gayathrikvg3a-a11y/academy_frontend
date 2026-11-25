import { BookOpen, BriefcaseBusiness, Mail, MapPin, Pencil, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { formatDateTime } from "@/lib/utils";

import {
  enquiryInterest,
  enquiryResponsible,
  enquiryStatusLabel,
  enquiryStatusTone,
} from "../utils/websiteEnquiries";

import StatusBadge from "./common/StatusBadge";

// One thing about the visitor, after an icon for what it is (named for
// screen readers).
function Fact({ icon: Icon, label, children }) {
  return (
    <li className="flex min-w-0 items-start gap-2.5">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 break-words">
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </li>
  );
}

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-0.5 font-medium break-words">{children || "-"}</div>
    </div>
  );
}

const contactLink = "font-medium underline-offset-4 hover:underline";

// One website enquiry in full. Who sent it and how to reach them come first,
// then what they wrote, set apart as what matters most, then the follow-up so
// far. Update opens the follow-up form on the same enquiry.
function WebsiteEnquiryDialog({
  enquiry,
  users,
  onClose,
  onEdit,
}) {
  const responsible = enquiry ? enquiryResponsible(enquiry, users) : "";
  const followedUp = Boolean(enquiry && (responsible || enquiry.recommended_by || enquiry.feedback));

  return (
    <Dialog open={Boolean(enquiry)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        {enquiry && (
          <>
            {/* Clear of the close button in the corner. */}
            <DialogHeader className="pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg">{enquiry.name}</DialogTitle>
                {enquiry.status && (
                  <StatusBadge
                    status={enquiry.status}
                    label={enquiryStatusLabel(enquiry.status)}
                    tone={enquiryStatusTone(enquiry.status)}
                  />
                )}
              </div>
              <DialogDescription>
                Received {formatDateTime(enquiry.created_at)}
              </DialogDescription>
            </DialogHeader>

            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              <Fact icon={Mail} label="Email">
                <a href={`mailto:${enquiry.email}`} className={contactLink}>
                  {enquiry.email}
                </a>
              </Fact>

              <Fact icon={Phone} label="Phone">
                <a href={`tel:${enquiry.phone_number}`} className={contactLink}>
                  {enquiry.phone_number}
                </a>
              </Fact>

              <Fact icon={MapPin} label="Location">
                {enquiry.location || "-"}
              </Fact>

              <Fact
                icon={enquiry.enquiry_type === "INTERNSHIP" ? BriefcaseBusiness : BookOpen}
                label="Enquiring about"
              >
                {enquiryInterest(enquiry)}
              </Fact>
            </ul>

            <section aria-labelledby="website-enquiry-message">
              <h3 id="website-enquiry-message" className="text-sm text-muted-foreground">
                Message
              </h3>
              <p className="mt-1.5 rounded-lg bg-muted/60 p-3.5 leading-relaxed whitespace-pre-line">
                {enquiry.message || "-"}
              </p>
            </section>

            <Separator />

            <section aria-labelledby="website-enquiry-follow-up">
              <h3 id="website-enquiry-follow-up" className="font-medium">
                Follow-up
              </h3>

              {followedUp ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Responsible Person">
                    {responsible}
                  </DetailItem>

                  <DetailItem label="Recommended By">
                    {enquiry.recommended_by}
                  </DetailItem>

                  <div className="sm:col-span-2">
                    <DetailItem label="Feedback">
                      {enquiry.feedback && (
                        <p className="font-normal leading-relaxed whitespace-pre-line">{enquiry.feedback}</p>
                      )}
                    </DetailItem>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  Nothing yet. Update it with who&apos;s handling it and how the conversation went.
                </p>
              )}
            </section>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>

              <Button onClick={() => onEdit(enquiry)}>
                <Pencil data-icon="inline-start" />
                Update
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WebsiteEnquiryDialog;
