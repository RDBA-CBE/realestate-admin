import { X } from "lucide-react";

interface Chip {
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: Chip[];
  onClearAll?: () => void;
}

export default function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip, index) => (
        <span
          key={index}
          className="flex items-center gap-1 rounded-full bg-[#fef9c3] px-3 py-1 text-xs font-medium text-[#000]"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-[#ca8a04] hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      { onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs text-[#9b0f09] underline hover:no-underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
