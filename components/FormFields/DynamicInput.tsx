import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { capitalizeFLetter } from "@/utils/function.utils";
import TextArea from "./TextArea.component";

export default function DynamicInput({
  defaultValue = [],
  onChange,
  title = "",
  required = false,
  placeholder = "Enter specialization",
  cols = 1,
  grid = false,
}) {
  const [items, setItems] = useState<{ specialization: string }[]>([{ specialization: "" }]);

  useEffect(() => {
    if (defaultValue?.length > 0) setItems(defaultValue);
  }, []);

  const handleChange = (index, value) => {
    const updated = [...items];
    updated[index] = { specialization: capitalizeFLetter(value) };
    setItems(updated);
    onChange && onChange(updated);
  };

  const addItem = () => {
    const updated = [...items, { specialization: "" }];
    setItems(updated);
    onChange && onChange(updated);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange && onChange(updated);
  };

  return (
    <div>
      {title && (
        <label className="mb-2 block text-sm font-bold text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`${grid ? "grid" : ""} gap-2`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center rounded-lg bg-white">
            <TextArea
            rows={3}
              value={item.specialization}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 text-sm outline-none"
            />
            {items.length > 1 && (
              <Trash2
                size={13}
                className="ml-2 shrink-0 cursor-pointer text-red-400 hover:text-red-600"
                onClick={() => removeItem(index)}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 rounded-lg border border-dred px-4 py-1 text-sm text-dred hover:bg-lred"
      >
        <Plus size={14} />
        Add
      </button>
    </div>
  );
}
