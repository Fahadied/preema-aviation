"use client";
import { useRef, useState, type KeyboardEvent } from "react";

type Tab = "flight" | "holiday" | "visa" | "hotel";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "flight", label: "Flights", icon: "M2.5 19h19M3.6 12.6l3.4 1 4.4-6.6 2.2.6-2.6 7.3 4.7 1.4 1.6-2.2 1.7.5-1 3.9-15.2-4.5z" },
  { id: "holiday", label: "Holidays", icon: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { id: "visa", label: "Visa assistance", icon: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3" },
  { id: "hotel", label: "Hotels", icon: "M3 20V6M3 14h18v6M3 10h7a3 3 0 0 1 3 3v1M17 10a2 2 0 1 0 0 .01" },
];

function todayISO() {
  return new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * One-row trip planner for the homepage hero. It doesn't submit anything itself: it opens the full
 * trip planner with these answers filled in, where the visitor adds contact details and sends the inquiry.
 */
export function QuickPlanner() {
  const [tab, setTab] = useState<Tab>("flight");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const min = todayISO();

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : -1;
    if (n < 0) return;
    e.preventDefault();
    setTab(TABS[n].id);
    refs.current[n]?.focus();
  }

  const label = "block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted";
  const input = "mt-1 block w-full min-h-11 rounded-md border border-line bg-white px-3 text-[15px] text-ink focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";
  const travellers = (name: string, l: string) => (
    <label className="block">
      <span className={label}>{l}</span>
      <select name={name} defaultValue="1" className={input}>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>{n} {name === "rooms" ? "room" : "traveller"}{n > 1 ? "s" : ""}</option>
        ))}
        <option value="5">5+ {name === "rooms" ? "rooms" : "travellers"}</option>
      </select>
    </label>
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_24px_70px_-30px_rgba(7,29,37,0.45)] ring-1 ring-black/5 sm:p-6">
      <div role="tablist" aria-label="What do you need?" className="-mx-1 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none]">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`qp-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="qp-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`-mb-px flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${
              tab === t.id ? "border-teal-600 text-navy-900" : "border-transparent text-muted hover:text-navy-900"
            }`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.id === "visa" ? (
              <>
                <span className="sm:hidden">Visa</span>
                <span className="hidden sm:inline">{t.label}</span>
              </>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      <form id="qp-panel" role="tabpanel" aria-labelledby={`qp-tab-${tab}`} action="/plan-your-trip" method="get" className="pt-5">
        <input type="hidden" name="type" value={tab} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr_0.8fr_auto] lg:items-end" key={tab}>
          {tab === "flight" && (
            <>
              <label className="block">
                <span className={label}>Travelling from</span>
                <input name="from" defaultValue="Dhaka, Bangladesh" className={input} autoComplete="off" />
              </label>
              <label className="block">
                <span className={label}>Where to?</span>
                <input name="to" placeholder="City or country" className={input} autoComplete="off" />
              </label>
              <label className="block">
                <span className={label}>Departure date</span>
                <input name="date" type="date" min={min} className={input} />
              </label>
              {travellers("travellers", "Travellers")}
            </>
          )}
          {tab === "holiday" && (
            <>
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className={label}>Where to?</span>
                <input name="to" placeholder="Leave empty if you'd like ideas" className={input} autoComplete="off" />
              </label>
              <label className="block">
                <span className={label}>Start date</span>
                <input name="date" type="date" min={min} className={input} />
              </label>
              <label className="block">
                <span className={label}>Nights</span>
                <input name="nights" type="number" min={1} max={60} defaultValue={4} className={input} inputMode="numeric" />
              </label>
              {travellers("travellers", "Travellers")}
            </>
          )}
          {tab === "visa" && (
            <>
              <label className="block">
                <span className={label}>Destination country</span>
                <input name="to" placeholder="e.g. Thailand" className={input} autoComplete="off" />
              </label>
              <label className="block">
                <span className={label}>Purpose</span>
                <select name="purpose" defaultValue="Tourism" className={input}>
                  {["Tourism", "Business", "Study", "Work", "Medical", "Family visit", "Transit", "Other"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>Travel date</span>
                <input name="date" type="date" min={min} className={input} />
              </label>
              {travellers("travellers", "Applicants")}
            </>
          )}
          {tab === "hotel" && (
            <>
              <label className="block">
                <span className={label}>Destination</span>
                <input name="to" placeholder="City or area" className={input} autoComplete="off" />
              </label>
              <label className="block">
                <span className={label}>Check-in</span>
                <input name="date" type="date" min={min} className={input} />
              </label>
              <label className="block">
                <span className={label}>Check-out</span>
                <input name="date2" type="date" min={min} className={input} />
              </label>
              {travellers("travellers", "Guests")}
            </>
          )}
          <button type="submit" className="btn-primary min-h-11 w-full whitespace-nowrap sm:col-span-2 lg:col-span-1 lg:w-auto">
            Plan my trip <span aria-hidden>↗</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Next you’ll add a few details and your contact number. This sends an inquiry to our team — it isn’t a live booking.
        </p>
      </form>
    </div>
  );
}
