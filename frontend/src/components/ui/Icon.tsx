/** Every icon the app renders; layout.tsx asks Google Fonts for exactly these glyphs. */
export const ICON_NAMES = [
  "accessibility_new",
  "arrow_back",
  "arrow_upward",
  "bedtime",
  "calendar_month",
  "check",
  "close",
  "dark_mode",
  "directions_run",
  "favorite",
  "forum",
  "insights",
  "light_mode",
  "person",
  "restart_alt",
  "restaurant",
  "spa",
  "today",
  "waving_hand",
  "water_drop",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

type Props = { name: IconName; size?: number; filled?: boolean; className?: string };

export default function Icon({ name, size = 24, filled = false, className = "" }: Props) {
  return (
    <span aria-hidden className={`icon ${filled ? "icon-filled" : ""} ${className}`} style={{ fontSize: size }}>
      {name}
    </span>
  );
}
