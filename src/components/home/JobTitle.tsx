import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  type DetectedPlace,
  detectPlace,
  JURISDICTIONS,
  type Jurisdiction,
  titleFor,
  type Verdict,
} from "@/lib/titleJurisdiction";
import { cn } from "@/lib/utils";

const VERDICT_LABEL: Record<Verdict, string> = {
  yes: "Engineer",
  no: "Developer",
  risky: "Developer, nervously",
};

const VERDICT_CLASS: Record<Verdict, string> = {
  yes: "text-emerald-700",
  no: "text-rose-700",
  risky: "text-amber-700",
};

/**
 * "Senior Software {Developer|Engineer}*", depending on where the reader is.
 * Renders "Developer" until mounted so crawlers and first paint get the real title.
 */
export default function JobTitle() {
  const [detected, setDetected] = useState<DetectedPlace | null>(null);
  const [picked, setPicked] = useState<Jurisdiction | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDetected(detectPlace());
  }, []);

  const active = picked ?? detected?.jurisdiction ?? null;
  const title = titleFor(active);

  // Hover opens a "peek"; a click pins it open until Esc / outside click / asterisk.
  const pinned = useRef(false);
  const setOpenState = (next: boolean) => {
    if (!next) pinned.current = false;
    setOpen(next);
  };

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || pinned.current) return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 200);
  };
  const pin = () => {
    window.clearTimeout(closeTimer.current);
    pinned.current = true;
    setOpen(true);
  };

  let eyebrow: React.ReactNode;
  if (picked) {
    eyebrow = (
      <>
        Pretending you're in <strong className="font-medium">{picked.inName ?? picked.name}</strong>, therefore I am a
      </>
    );
  } else if (detected) {
    eyebrow = (
      <>
        It looks like you're in <strong className="font-medium">{detected.place}</strong>, therefore I am a
      </>
    );
  } else {
    eyebrow = "I can't tell where you are, so I'm playing it safe. I am a";
  }

  return (
    <Popover open={open} onOpenChange={setOpenState}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className="cursor-pointer mb-6"
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onClick={pin}
        >
          <p className="text-base md:text-lg text-slate-500 font-light mb-3 min-h-[1.75rem]">{eyebrow}</p>
          <h1 className="text-6xl md:text-7xl font-light text-slate-900 tracking-tight">
            Senior Software
            <span className="block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium"
                >
                  {title}
                </motion.span>
              </AnimatePresence>
              <button
                type="button"
                aria-label="Why does my title depend on where you are?"
                aria-expanded={open}
                onClick={(e) => {
                  e.stopPropagation();
                  if (open && pinned.current) setOpenState(false);
                  else pin();
                }}
                className="align-super text-3xl md:text-4xl text-indigo-500 hover:text-indigo-700 ml-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                *
              </button>
            </span>
          </h1>
        </div>
      </PopoverAnchor>

      <PopoverContent
        side="bottom"
        className="w-[min(92vw,30rem)] p-5 text-left"
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
        onInteractOutside={(e) => {
          // The title block manages its own clicks; don't close-then-reopen.
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
      >
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-medium text-slate-900">*</span> In most of Canada, “engineer” is a protected title. I've
          designed distributed systems, but I've never stamped a bridge, so legally I <em>develop</em>. Where you
          are, the rules might let me use the other word.
        </p>
        {!picked && detected?.aside && <p className="mt-2 text-sm text-amber-700">{detected.aside}</p>}

        <p className="mt-4 mb-2 text-xs uppercase tracking-wide text-slate-400">Try another place</p>
        <ul className="max-h-[min(22rem,45vh)] overflow-y-auto divide-y divide-slate-100 rounded-md border border-slate-200">
          {JURISDICTIONS.map((j) => {
            const isActive = active?.id === j.id;
            return (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => setPicked(j.id === detected?.jurisdiction.id ? null : j)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50",
                    isActive && "bg-indigo-50 hover:bg-indigo-50",
                  )}
                  aria-pressed={isActive}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-slate-800">
                      <span aria-hidden="true">{j.flag}</span> {j.name}
                    </span>
                    <span className={cn("text-xs font-medium whitespace-nowrap", VERDICT_CLASS[j.verdict])}>
                      {VERDICT_LABEL[j.verdict]}
                    </span>
                  </span>
                  {isActive && <span className="block mt-1 text-xs text-slate-500 leading-snug">{j.note}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          Guessed from your browser's timezone. Nothing is sent anywhere. Not legal advice.
        </p>
      </PopoverContent>
    </Popover>
  );
}
