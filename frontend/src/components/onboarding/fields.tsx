import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";

const inputClass =
  "h-13.5 w-full rounded-2xl border-[1.5px] border-line2 bg-card px-4 text-[17px] font-medium text-ink outline-none focus:border-teal";

const hintClass = "text-sm leading-snug text-mute";

type FieldProps = { id: string; label: string; hint?: string };

function Field({ id, label, hint, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

type TextProps = FieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export function TextInput({ value, onChange, placeholder, maxLength, ...field }: TextProps) {
  return (
    <Field {...field}>
      <input
        id={field.id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClass}
      />
    </Field>
  );
}

export function TextArea({ value, onChange, placeholder, maxLength, ...field }: TextProps) {
  return (
    <Field {...field}>
      <textarea
        id={field.id}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none rounded-[14px] border-[1.5px] border-line2 bg-bg px-3.5 py-3 text-base leading-snug text-ink outline-none focus:border-teal"
      />
    </Field>
  );
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  integer = false,
  ...field
}: Omit<TextProps, "maxLength"> & { suffix?: string; integer?: boolean }) {
  return (
    <Field {...field}>
      <div className="relative">
        <input
          id={field.id}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={6}
          className={`${inputClass} ${suffix ? "pr-16" : ""}`}
        />
        {suffix && <span className="absolute top-4 right-4 text-base font-medium text-mute">{suffix}</span>}
      </div>
    </Field>
  );
}

export function ChoiceGroup({
  legend,
  hint,
  aside,
  grid,
  children,
}: {
  legend: string;
  hint?: string;
  aside?: ReactNode;
  /** Equal-width buttons in a grid (e.g. "grid-cols-7") instead of wrapping pills. */
  grid?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 flex w-full justify-between text-base font-semibold">
        {legend}
        {aside}
      </legend>
      <div className={grid ? `grid gap-1.5 ${grid}` : "flex flex-wrap gap-2"}>{children}</div>
      {hint && <p className={hintClass}>{hint}</p>}
    </fieldset>
  );
}

type Tone = "teal" | "lav";

const selectedClass: Record<Tone, string> = {
  teal: "border-teal bg-teal text-on-teal",
  lav: "border-lav bg-lav-soft text-lav-ink",
};

export function Choice({
  selected,
  onClick,
  tone = "teal",
  square = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  tone?: Tone;
  /** Rounded-rectangle cell for grids; pills otherwise. */
  square?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-11.5 items-center justify-center gap-1.5 border-[1.5px] text-[15px] font-semibold transition-colors ${
        square ? "rounded-xl px-1" : "rounded-full px-3.5"
      } ${selected ? selectedClass[tone] : "border-line2 bg-card text-ink hover:border-teal"}`}
    >
      {selected && !square && <Icon name="check" size={18} />}
      {children}
    </button>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 items-center gap-3 text-left text-base font-medium"
    >
      <span
        className={`grid size-6.5 flex-none place-items-center rounded-lg border-2 border-teal text-on-teal ${checked ? "bg-teal" : ""}`}
      >
        {checked && <Icon name="check" size={20} />}
      </span>
      {label}
    </button>
  );
}

export function OptionalBadge({ tone = "plain" }: { tone?: "plain" | "lav" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "lav" ? "bg-card text-lav-ink" : "bg-card2 text-mute"}`}
    >
      Opcional
    </span>
  );
}
