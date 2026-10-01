import type { ReactNode } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900";

const hintClass = "text-xs text-zinc-500 dark:text-zinc-400";

type FieldProps = { id: string; label: string; hint?: string };

function Field({ id, label, hint, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${inputClass} resize-none`}
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
      <div className="flex items-center gap-2">
        <input
          id={field.id}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={6}
          className={`${inputClass} max-w-36`}
        />
        {suffix && <span className="text-sm text-zinc-500">{suffix}</span>}
      </div>
    </Field>
  );
}

export function ChoiceGroup({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {hint && <p className={hintClass}>{hint}</p>}
    </fieldset>
  );
}

export function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        selected
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: FieldProps & { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-teal-600"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
        {hint && <span className={hintClass}>{hint}</span>}
      </span>
    </label>
  );
}
