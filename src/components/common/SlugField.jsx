import { useState } from "react";
import { LockOpen, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import ConfirmDialog from "./ConfirmDialog";

// ================= SLUG FIELD =================
//
// The slug is locked: a new item's is made from its name, and a saved item's
// stays put, since a new slug is a new address and links to the old one stop
// working. Unlocking it, after a warning, lets it be typed; Undo puts back the
// slug the form opened with and locks it again. The form keeps the slug and
// whether it's unlocked, and this only shows them.
//
// A saved item that's been renamed keeps its slug, but is offered the one its
// new name gives (`suggestedSlug`, from the form). Taking it unlocks the slug
// with that filled in, and the slug then follows the name as it's edited
// further (`following`) until it's typed in. Undo still puts back the old one.
//
// `path` is where the item's pages live, such as "/courses/"; `what` and
// `source` name the item and what its slug is made from, for the messages.

function SlugField({
  value,
  error,
  saving,
  saved,
  unlocked,
  openingSlug,
  path,
  what,
  source,
  placeholder,
  suggestedSlug = "",
  following = false,
  onChange,
  onBlur,
  onUnlock,
  onLock,
  onUseSuggestion,
}) {
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  const unlock = () => {
    setConfirmUnlock(false);
    onUnlock();
  };

  return (
    <>
      <Field data-invalid={!!error || undefined}>
        <FieldLabel>Slug</FieldLabel>

        <div className="flex gap-2">
          <Input
            name="slug"
            value={value ?? ""}
            placeholder={placeholder}
            disabled={!unlocked}
            aria-invalid={!!error}
            onChange={onChange}
            onBlur={onBlur}
          />

          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={saving}
            onClick={
              unlocked
                ? onLock
                : () => setConfirmUnlock(true)
            }
          >
            {unlocked ? (
              <Undo2 data-icon="inline-start" />
            ) : (
              <LockOpen data-icon="inline-start" />
            )}
            {unlocked ? "Undo" : "Unlock"}
          </Button>
        </div>

        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <p className="text-sm text-muted-foreground">
            {saved
              ? unlocked
                ? `${following ? `Follows the ${source} as it's typed. ` : ""}Links to the old address, ${path}${openingSlug}/, stop working once this changes.`
                : `The ${what} page is ${path}${value}/.`
              : unlocked
                ? "Lowercase words joined by hyphens."
                : `Made from the ${source}.`}
          </p>
        )}

        {suggestedSlug && !unlocked && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-dashed px-3 py-2 text-sm">
            <p className="text-muted-foreground">
              The new {source} gives{" "}
              <span className="font-medium text-foreground">
                {path}{suggestedSlug}/
              </span>
              . Using it moves the {what} page, and links to the current
              address stop working.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={onUseSuggestion}
            >
              Use new slug
            </Button>
          </div>
        )}
      </Field>

      <ConfirmDialog
        open={confirmUnlock}
        title="Unlock the slug?"
        message={
          saved
            ? `The ${what} page is at ${path}${openingSlug}/. A new slug moves it to a new address, and links to the old one, on Google, in WhatsApp messages and in ads, stop working.`
            : `The slug is made from the ${source}. You can type your own, but once the ${what} is saved it shouldn't change, as links to its page would stop working.`
        }
        confirmText="Unlock"
        cancelText="Cancel"
        confirmColor={saved ? "error" : "default"}
        onConfirm={unlock}
        onClose={() => setConfirmUnlock(false)}
      />
    </>
  );
}

export default SlugField;
