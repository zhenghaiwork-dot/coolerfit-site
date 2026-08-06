/**
 * Vanilla replacement for the Radix toast + shadcn `useToast` pair.
 *
 * Behaviour matches the original: one toast at a time (TOAST_LIMIT = 1) and a
 * 5s auto-dismiss, which is Radix's default Root duration. Markup and classes
 * mirror the React components so the appearance is unchanged.
 */
const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 250;

const CLOSE_ICON =
  '<svg class="lucide lucide-x h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

const BASE_CLASS =
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full";

const VARIANT_CLASS = {
  default: "border bg-background text-foreground",
  destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
} as const;

const CLOSE_CLASS =
  "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-destructive-foreground/70 hover:text-foreground group-[.destructive]:hover:text-destructive-foreground focus:opacity-100 focus:outline-hidden focus:ring-2 group-[.destructive]:focus:ring-destructive-foreground/50 group-[.destructive]:focus:ring-offset-destructive";

const VIEWPORT_CLASS =
  "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: keyof typeof VARIANT_CLASS;
};

function getViewport(): HTMLElement {
  let viewport = document.querySelector<HTMLElement>("[data-toast-viewport]");
  if (!viewport) {
    viewport = document.createElement("ol");
    viewport.setAttribute("data-toast-viewport", "");
    viewport.tabIndex = -1;
    viewport.className = VIEWPORT_CLASS;
    document.body.appendChild(viewport);
  }
  return viewport;
}

function dismiss(el: HTMLElement) {
  if (el.dataset.state === "closed") return;
  el.dataset.state = "closed";
  setTimeout(() => el.remove(), EXIT_ANIMATION_MS);
}

export function toast({ title, description, variant = "default" }: ToastOptions) {
  const viewport = getViewport();

  // TOAST_LIMIT = 1 — a new toast replaces whatever is on screen.
  viewport.querySelectorAll<HTMLElement>("[data-toast]").forEach((el) => el.remove());

  const item = document.createElement("li");
  item.setAttribute("data-toast", "");
  item.dataset.state = "open";
  item.setAttribute("role", "status");
  item.setAttribute("aria-live", "off");
  item.setAttribute("aria-atomic", "true");
  item.tabIndex = 0;
  item.className = `${BASE_CLASS} ${VARIANT_CLASS[variant]}`;

  const body = document.createElement("div");
  body.className = "grid gap-1";

  if (title) {
    const t = document.createElement("div");
    t.className = "text-sm font-semibold";
    t.textContent = title;
    body.appendChild(t);
  }

  if (description) {
    const d = document.createElement("div");
    d.className = "text-sm opacity-90";
    d.textContent = description;
    body.appendChild(d);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("toast-close", "");
  close.setAttribute("aria-label", "Close");
  close.className = CLOSE_CLASS;
  close.innerHTML = CLOSE_ICON;
  close.addEventListener("click", () => dismiss(item));

  item.append(body, close);
  viewport.appendChild(item);

  const timer = setTimeout(() => dismiss(item), AUTO_DISMISS_MS);
  item.addEventListener("pointerenter", () => clearTimeout(timer));
}
