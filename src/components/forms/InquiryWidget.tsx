"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  CURRENCY_CODES,
  VISA_PURPOSES,
  contactSchema,
  destinationDetails,
  flightDetails,
  holidayDetails,
  hotelDetails,
  issuesToFieldErrors,
  packageDetails,
  visaDetails,
} from "@/lib/inquiry-schema";
import { Checkbox, FormAlert, SelectField, TextArea, TextField } from "./fields";
import { bool, detailErrors, str, useInquirySubmit } from "./useInquirySubmit";
import { SuccessPanel } from "./SuccessPanel";

export type WidgetType = "flight" | "holiday" | "visa" | "hotel" | "package" | "destination";

const TAB_LABELS: Record<WidgetType, string> = {
  flight: "Flights",
  holiday: "Holidays",
  visa: "Visa assistance",
  hotel: "Hotels",
  package: "This package",
  destination: "This destination",
};

const SCHEMAS = {
  flight: flightDetails,
  holiday: holidayDetails,
  visa: visaDetails,
  hotel: hotelDetails,
  package: packageDetails,
  destination: destinationDetails,
} as const;

const INTERESTS = ["Beach", "City break", "Culture & heritage", "Nature", "Adventure", "Shopping", "Food", "Family fun", "Honeymoon", "Relaxation"];
const currencyOptions = CURRENCY_CODES.map((c) => ({ value: c, label: c === "BDT" ? "BDT (৳)" : c }));

function todayISO() {
  const now = new Date(Date.now() + 6 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

interface Props {
  types?: WidgetType[];
  initialType?: WidgetType;
  packageContext?: { slug: string; title: string; minTravellers?: number | null };
  destinationContext?: { slug: string; name: string };
  whatsapp?: string | null;
  variant?: "hero" | "page";
  heading?: string;
}

export function InquiryWidget({
  types = ["flight", "holiday", "visa", "hotel"],
  initialType,
  packageContext,
  destinationContext,
  whatsapp,
  variant = "page",
  heading,
}: Props) {
  const uid = useId();
  const [type, setType] = useState<WidgetType>(initialType && types.includes(initialType) ? initialType : types[0]);
  const [step, setStep] = useState<"details" | "contact">("details");
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tripType, setTripType] = useState<"round_trip" | "one_way" | "multi_city">("round_trip");
  const [legCount, setLegCount] = useState(2);
  const [helpChoose, setHelpChoose] = useState(false);
  const { state, submit, reset, fieldErrors } = useInquirySubmit();
  const forms = useRef<Partial<Record<WidgetType, HTMLFormElement | null>>>({});
  const contactRef = useRef<HTMLFormElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const min = useMemo(todayISO, []);

  // Server-side field errors: route them back to the step they belong to.
  useEffect(() => {
    const keys = Object.keys(fieldErrors);
    if (!keys.length) return;
    const d = detailErrors(fieldErrors);
    setErrors(d);
    if (keys.some((k) => k.startsWith("details."))) setStep("details");
  }, [fieldErrors]);

  useEffect(() => {
    if (state.kind === "success") headingRef.current?.focus();
  }, [state.kind]);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % types.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + types.length) % types.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = types.length - 1;
    else return;
    e.preventDefault();
    selectType(types[next]);
    tabRefs.current[next]?.focus();
  }

  function selectType(t: WidgetType) {
    setType(t);
    setStep("details");
    setErrors({});
  }

  function buildDetails(t: WidgetType, fd: FormData): Record<string, unknown> {
    switch (t) {
      case "flight": {
        const legs =
          tripType === "multi_city"
            ? Array.from({ length: legCount }, (_, i) => ({
                from: str(fd, `legs.${i}.from`),
                to: str(fd, `legs.${i}.to`),
                date: str(fd, `legs.${i}.date`),
              }))
            : undefined;
        return {
          trip_type: tripType,
          from: str(fd, "from"),
          to: str(fd, "to"),
          depart_date: str(fd, "depart_date"),
          return_date: tripType === "round_trip" ? str(fd, "return_date") : undefined,
          legs,
          adults: str(fd, "adults"),
          children: str(fd, "children"),
          infants: str(fd, "infants"),
          cabin: str(fd, "cabin"),
          flexible_dates: bool(fd, "flexible_dates"),
          notes: str(fd, "notes"),
        };
      }
      case "holiday":
        return {
          help_me_choose: helpChoose,
          destination: helpChoose ? "" : str(fd, "destination"),
          date_from: str(fd, "date_from"),
          date_to: str(fd, "date_to"),
          nights: str(fd, "nights"),
          adults: str(fd, "adults"),
          children: str(fd, "children"),
          budget_amount: str(fd, "budget_amount"),
          budget_currency: str(fd, "budget_currency"),
          budget_basis: str(fd, "budget_basis"),
          interests: fd.getAll("interests").map(String),
          notes: str(fd, "notes"),
        };
      case "visa":
        return {
          destination_country: str(fd, "destination_country"),
          nationality: str(fd, "nationality"),
          residence_country: str(fd, "residence_country"),
          purpose: str(fd, "purpose"),
          travel_date: str(fd, "travel_date"),
          applicants: str(fd, "applicants"),
          notes: str(fd, "notes"),
        };
      case "hotel":
        return {
          destination: str(fd, "destination"),
          check_in: str(fd, "check_in"),
          check_out: str(fd, "check_out"),
          guests: str(fd, "guests"),
          rooms: str(fd, "rooms"),
          category: str(fd, "category"),
          budget_amount: str(fd, "budget_amount"),
          budget_currency: str(fd, "budget_currency"),
          notes: str(fd, "notes"),
        };
      case "package":
        return {
          preferred_date: str(fd, "preferred_date"),
          adults: str(fd, "adults"),
          children: str(fd, "children"),
          notes: str(fd, "notes"),
        };
      case "destination":
        return {
          preferred_date: str(fd, "preferred_date"),
          nights: str(fd, "nights"),
          travellers: str(fd, "travellers"),
          notes: str(fd, "notes"),
        };
    }
  }

  function focusFirstError(form: HTMLFormElement | null | undefined) {
    requestAnimationFrame(() => {
      const el = form?.querySelector<HTMLElement>("[aria-invalid='true']");
      el?.focus();
    });
  }

  function onContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = buildDetails(type, new FormData(form));
    const parsed = SCHEMAS[type].safeParse(raw);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(parsed.error));
      focusFirstError(form);
      return;
    }
    setErrors({});
    setDetails(parsed.data as Record<string, unknown>);
    setStep("contact");
    requestAnimationFrame(() => contactRef.current?.querySelector<HTMLInputElement>("input")?.focus());
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!details) return setStep("details");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const contact = {
      customer_name: str(fd, "customer_name"),
      customer_phone: str(fd, "customer_phone"),
      customer_email: str(fd, "customer_email"),
      privacy_ack: bool(fd, "privacy_ack"),
    };
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(parsed.error));
      focusFirstError(form);
      return;
    }
    setErrors({});
    await submit({
      ...contact,
      website: str(fd, "website"),
      type,
      details,
      package_slug: packageContext?.slug,
      destination_slug: destinationContext?.slug,
    });
  }

  function startOver() {
    Object.values(forms.current).forEach((f) => f?.reset());
    contactRef.current?.reset();
    setDetails(null);
    setStep("details");
    setHelpChoose(false);
    setTripType("round_trip");
    reset();
  }

  const isHero = variant === "hero";
  const shell = isHero
    ? "rounded-[1.5rem] bg-white/95 p-4 shadow-[0_30px_80px_-30px_rgba(7,21,38,0.55)] ring-1 ring-black/5 backdrop-blur sm:p-6"
    : "card p-5 sm:p-7";

  if (state.kind === "success") {
    return (
      <div className={shell}>
        <SuccessPanel reference={state.reference} whatsapp={whatsapp} onReset={startOver} headingRef={headingRef} />
      </div>
    );
  }

  const e = errors;
  const grid = "grid gap-4 sm:grid-cols-2";

  return (
    <div className={shell}>
      {heading ? <h2 className="mb-4 text-2xl">{heading}</h2> : null}
      {packageContext ? (
        <p className="mb-4 rounded-xl bg-mint-100 px-4 py-3 text-sm text-navy-900">
          Inquiring about <strong>{packageContext.title}</strong>
        </p>
      ) : destinationContext ? (
        <p className="mb-4 rounded-xl bg-mint-100 px-4 py-3 text-sm text-navy-900">
          Planning a trip to <strong>{destinationContext.name}</strong>
        </p>
      ) : null}

      {types.length > 1 ? (
        <div role="tablist" aria-label="Inquiry type" className="-mx-1 mb-5 flex gap-1 overflow-x-auto pb-1">
          {types.map((t, i) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${t}`}
              aria-selected={type === t}
              aria-controls={`${uid}-panel-${t}`}
              tabIndex={type === t ? 0 : -1}
              onClick={() => selectType(t)}
              onKeyDown={(ev) => onTabKey(ev, i)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                type === t ? "bg-navy-900 text-white" : "text-navy-800 hover:bg-ivory-100"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      ) : null}

      <ol className="mb-4 flex items-center gap-2 text-xs font-medium text-muted" aria-label="Progress">
        <li className={step === "details" ? "text-teal-700" : ""} aria-current={step === "details" ? "step" : undefined}>
          1. Travel details
        </li>
        <li aria-hidden>→</li>
        <li className={step === "contact" ? "text-teal-700" : ""} aria-current={step === "contact" ? "step" : undefined}>
          2. Your contact details
        </li>
      </ol>

      {types.map((t) => (
        <div
          key={t}
          id={`${uid}-panel-${t}`}
          role={types.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={types.length > 1 ? `${uid}-tab-${t}` : undefined}
          hidden={t !== type || step !== "details"}
        >
          <form
            ref={(el) => {
              forms.current[t] = el;
            }}
            noValidate
            onSubmit={onContinue}
            className="space-y-4"
          >
            {t === "flight" && (
              <>
                <fieldset>
                  <legend className="field-label">Trip type</legend>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["round_trip", "Round trip"],
                        ["one_way", "One-way"],
                        ["multi_city", "Multi-city"],
                      ] as const
                    ).map(([v, l]) => (
                      <label
                        key={v}
                        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm ${
                          tripType === v ? "border-teal-600 bg-teal-100 text-navy-900" : "border-line"
                        }`}
                      >
                        <input
                          type="radio"
                          name="trip_type"
                          value={v}
                          checked={tripType === v}
                          onChange={() => setTripType(v)}
                          className="accent-teal-600"
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {tripType !== "multi_city" ? (
                  <div className={grid}>
                    <TextField name="from" label="From (city or airport)" required defaultValue="Dhaka" error={e.from} autoComplete="off" />
                    <TextField name="to" label="To (city or airport)" required error={e.to} autoComplete="off" />
                    <TextField name="depart_date" type="date" label="Departure date" required min={min} error={e.depart_date} />
                    {tripType === "round_trip" ? (
                      <TextField name="return_date" type="date" label="Return date" required min={min} error={e.return_date} />
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: legCount }, (_, i) => (
                      <fieldset key={i} className="rounded-xl border border-line p-3">
                        <legend className="px-1 text-sm font-semibold text-navy-900">Flight {i + 1}</legend>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <TextField name={`legs.${i}.from`} label="From" required defaultValue={i === 0 ? "Dhaka" : undefined} error={e[`legs.${i}.from`]} />
                          <TextField name={`legs.${i}.to`} label="To" required error={e[`legs.${i}.to`]} />
                          <TextField name={`legs.${i}.date`} type="date" label="Date" required min={min} error={e[`legs.${i}.date`]} />
                        </div>
                      </fieldset>
                    ))}
                    {e.legs ? <p className="field-error" role="alert">{e.legs}</p> : null}
                    <div className="flex gap-2">
                      {legCount < 5 ? (
                        <button type="button" className="btn-secondary" onClick={() => setLegCount((c) => c + 1)}>
                          Add another flight
                        </button>
                      ) : null}
                      {legCount > 2 ? (
                        <button type="button" className="btn-secondary" onClick={() => setLegCount((c) => c - 1)}>
                          Remove last flight
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <TextField name="adults" type="number" label="Adults" required defaultValue={1} min={1} max={9} inputMode="numeric" error={e.adults} hint="12+ yrs" />
                  <TextField name="children" type="number" label="Children" required defaultValue={0} min={0} max={9} inputMode="numeric" error={e.children} hint="2–11 yrs" />
                  <TextField name="infants" type="number" label="Infants" required defaultValue={0} min={0} max={9} inputMode="numeric" error={e.infants} hint="Under 2" />
                </div>
                <div className={grid}>
                  <SelectField
                    name="cabin"
                    label="Cabin class"
                    required
                    defaultValue="economy"
                    options={[
                      { value: "economy", label: "Economy" },
                      { value: "premium_economy", label: "Premium economy" },
                      { value: "business", label: "Business" },
                      { value: "first", label: "First" },
                    ]}
                    error={e.cabin}
                  />
                  <Checkbox name="flexible_dates" label="My dates are flexible (± a few days)" className="sm:pt-7" />
                </div>
                <TextArea name="notes" label="Anything else we should know?" placeholder="Preferred airline, timing, baggage needs…" error={e.notes} rows={2} />
              </>
            )}

            {t === "holiday" && (
              <>
                <div className={grid}>
                  <TextField
                    name="destination"
                    label="Destination"
                    required={!helpChoose}
                    defaultValue={destinationContext?.name}
                    placeholder={helpChoose ? "We will suggest options" : "e.g. Maldives, Nepal, Cox's Bazar"}
                    error={e.destination}
                  />
                  <Checkbox name="help_me_choose" label="Help me choose a destination" className="sm:pt-7" onChange={setHelpChoose} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField name="date_from" type="date" label="Preferred start date" min={min} error={e.date_from} />
                  <TextField name="date_to" type="date" label="Latest return date" min={min} error={e.date_to} />
                  <TextField name="nights" type="number" label="Nights" required defaultValue={4} min={1} max={60} inputMode="numeric" error={e.nights} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField name="adults" type="number" label="Adults" required defaultValue={2} min={1} max={50} inputMode="numeric" error={e.adults} />
                  <TextField name="children" type="number" label="Children" required defaultValue={0} min={0} max={30} inputMode="numeric" error={e.children} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField name="budget_amount" type="number" label="Approximate budget" min={0} inputMode="numeric" error={e.budget_amount} />
                  <SelectField name="budget_currency" label="Currency" required defaultValue="BDT" options={currencyOptions} />
                  <SelectField
                    name="budget_basis"
                    label="Budget is"
                    required
                    defaultValue="total"
                    options={[
                      { value: "total", label: "For the whole trip" },
                      { value: "per_person", label: "Per person" },
                    ]}
                  />
                </div>
                <fieldset>
                  <legend className="field-label">
                    Travel interests <span className="text-xs font-normal text-muted">(optional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <label key={i} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-3 text-sm has-[:checked]:border-teal-600 has-[:checked]:bg-teal-100">
                        <input type="checkbox" name="interests" value={i} className="accent-teal-600" />
                        {i}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <TextArea name="notes" label="Notes" placeholder="Hotel style, special occasions, accessibility needs…" error={e.notes} rows={2} />
              </>
            )}

            {t === "visa" && (
              <>
                <div className={grid}>
                  <TextField name="destination_country" label="Destination country" required error={e.destination_country} />
                  <SelectField
                    name="purpose"
                    label="Purpose of visit"
                    required
                    defaultValue="Tourism"
                    options={VISA_PURPOSES.map((p) => ({ value: p, label: p }))}
                    error={e.purpose}
                  />
                  <TextField name="nationality" label="Applicant nationality" required defaultValue="Bangladeshi" error={e.nationality} />
                  <TextField name="residence_country" label="Country of residence" required defaultValue="Bangladesh" error={e.residence_country} />
                  <TextField name="travel_date" type="date" label="Intended travel date" min={min} error={e.travel_date} />
                  <TextField name="applicants" type="number" label="Number of applicants" required defaultValue={1} min={1} max={50} inputMode="numeric" error={e.applicants} />
                </div>
                <TextArea name="notes" label="Notes" placeholder="Previous travel, occupation type, urgency…" error={e.notes} rows={2} />
                <p className="text-xs text-muted">
                  Please don’t upload passport or ID copies here. Visa decisions are made by the relevant authority; we help you prepare.
                </p>
              </>
            )}

            {t === "hotel" && (
              <>
                <TextField name="destination" label="Destination or area" required defaultValue={destinationContext?.name} error={e.destination} />
                <div className={grid}>
                  <TextField name="check_in" type="date" label="Check-in" required min={min} error={e.check_in} />
                  <TextField name="check_out" type="date" label="Check-out" required min={min} error={e.check_out} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <TextField name="guests" type="number" label="Guests" required defaultValue={2} min={1} max={50} inputMode="numeric" error={e.guests} />
                  <TextField name="rooms" type="number" label="Rooms" required defaultValue={1} min={1} max={25} inputMode="numeric" error={e.rooms} />
                  <SelectField
                    name="category"
                    label="Hotel category"
                    required
                    defaultValue="any"
                    className="col-span-2 sm:col-span-1"
                    options={[
                      { value: "any", label: "No preference" },
                      { value: "3_star", label: "3-star" },
                      { value: "4_star", label: "4-star" },
                      { value: "5_star", label: "5-star" },
                      { value: "resort", label: "Resort" },
                      { value: "apartment", label: "Serviced apartment" },
                    ]}
                  />
                </div>
                <div className={grid}>
                  <TextField name="budget_amount" type="number" label="Approx. budget per night" min={0} inputMode="numeric" error={e.budget_amount} />
                  <SelectField name="budget_currency" label="Currency" required defaultValue="BDT" options={currencyOptions} />
                </div>
                <TextArea name="notes" label="Notes" placeholder="Location preferences, bed type, breakfast…" error={e.notes} rows={2} />
              </>
            )}

            {t === "package" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField name="preferred_date" type="date" label="Preferred travel date" min={min} error={e.preferred_date} />
                  <TextField
                    name="adults"
                    type="number"
                    label="Adults"
                    required
                    defaultValue={Math.max(packageContext?.minTravellers ?? 2, 1)}
                    min={1}
                    max={50}
                    inputMode="numeric"
                    error={e.adults}
                  />
                  <TextField name="children" type="number" label="Children" required defaultValue={0} min={0} max={30} inputMode="numeric" error={e.children} />
                </div>
                <TextArea name="notes" label="Notes or changes you would like" error={e.notes} rows={3} />
              </>
            )}

            {t === "destination" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField name="preferred_date" type="date" label="Preferred travel date" min={min} error={e.preferred_date} />
                  <TextField name="nights" type="number" label="Nights" required defaultValue={4} min={1} max={60} inputMode="numeric" error={e.nights} />
                  <TextField name="travellers" type="number" label="Travellers" required defaultValue={2} min={1} max={50} inputMode="numeric" error={e.travellers} />
                </div>
                <TextArea name="notes" label="What would you like to do there?" error={e.notes} rows={3} />
              </>
            )}

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
              <p className="text-xs text-muted">Next: your name and phone number. Nothing is booked yet.</p>
              <button type="submit" className="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
      ))}

      <div hidden={step !== "contact"}>
        <form ref={contactRef} noValidate onSubmit={onSubmit} className="space-y-4" aria-busy={state.kind === "submitting"}>
          <div className={grid}>
            <TextField name="customer_name" label="Full name" required autoComplete="name" error={e.customer_name} />
            <TextField
              name="customer_phone"
              type="tel"
              label="Phone (WhatsApp if possible)"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="+8801XXXXXXXXX"
              error={e.customer_phone}
            />
          </div>
          <TextField name="customer_email" type="email" label="E-mail" autoComplete="email" inputMode="email" error={e.customer_email} />
          {/* Honeypot: hidden from people, tempting for bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="rounded-xl bg-ivory-100 p-4 text-xs leading-5 text-muted">
            <p>
              We use these details only to respond to your inquiry. Fares, availability and package details can change until
              confirmed and issued; visa decisions rest with the relevant authority. We never ask for passport scans or card
              details on this website. Read our{" "}
              <Link href="/privacy" className="text-teal-700 underline">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-teal-700 underline">
                booking conditions
              </Link>
              .
            </p>
          </div>
          <Checkbox name="privacy_ack" label="I have read the privacy notice and agree to be contacted about this inquiry." error={e.privacy_ack} />
          {state.kind === "error" ? <FormAlert>{state.message}</FormAlert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="btn-secondary" onClick={() => setStep("details")} disabled={state.kind === "submitting"}>
              Back to travel details
            </button>
            <button type="submit" className="btn-primary" disabled={state.kind === "submitting"}>
              {state.kind === "submitting" ? "Sending…" : type === "visa" || type === "hotel" || type === "flight" ? "Request options" : "Request a quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
