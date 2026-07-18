import { CATEGORIES, type Category } from "../types";

interface CategoryPickerProps {
  value: Category | "alle";
  onChange: (value: Category | "alle") => void;
  counts?: Partial<Record<Category | "alle", number>>;
}

export default function CategoryPicker({ value, onChange, counts }: CategoryPickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
      <Chip
        label="Alle"
        emoji="✨"
        count={counts?.alle}
        active={value === "alle"}
        onClick={() => onChange("alle")}
      />
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          label={c.label}
          emoji={c.emoji}
          count={counts?.[c.id]}
          active={value === c.id}
          onClick={() => onChange(c.id)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  emoji,
  count,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-rose-600 text-white"
          : "bg-white text-gray-500 border border-rose-100 dark:bg-neutral-900 dark:text-gray-400 dark:border-neutral-700"
      }`}
    >
      <span>{emoji}</span>
      {label}
      {typeof count === "number" && (
        <span className={active ? "text-rose-100" : "text-gray-400 dark:text-gray-500"}>{count}</span>
      )}
    </button>
  );
}
