"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type FormState = { error?: string; ok?: string } | undefined;
export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

/** A form bound to a server action that reports `{ error }` / `{ ok }` back to the user. */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p className="mt-3 text-[13px] text-bad">{state.error}</p>}
      {state?.ok && <p className="mt-3 text-[13px] text-ok">{state.ok}</p>}
    </form>
  );
}

export function Submit({ children, className = "btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Working…" : children}
    </button>
  );
}
