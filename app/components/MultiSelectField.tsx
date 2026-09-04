'use client';

import { useMemo, useState } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export default function MultiSelectField({
  name,
  options,
  defaultValues = [],
  max,
  disabled = false,
  searchPlaceholder = 'Search...',
  emptyLabel = 'No options available.',
  maxHeight = 220,
}: {
  name: string;
  options: MultiSelectOption[];
  defaultValues?: string[];
  /** Once this many are checked, unchecked rows are disabled. */
  max?: number;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  maxHeight?: number;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValues));
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [options, query]);

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (max && next.size >= max) return prev;
        next.add(value);
      }
      return next;
    });
  }

  const atMax = !!max && selected.size >= max;

  return (
    <div className={`msel${disabled ? ' is-disabled' : ''}`}>
      {options.length > 6 && (
        <input
          type="text"
          className="msel-search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
      )}
      <div className="msel-list" style={{ maxHeight }} role="listbox" aria-multiselectable="true">
        {filtered.length === 0 && <div className="msel-empty">{emptyLabel}</div>}
        {filtered.map((opt) => {
          const checked = selected.has(opt.value);
          const rowDisabled = disabled || (!checked && atMax);
          return (
            <label
              key={opt.value}
              className={`msel-row${checked ? ' is-checked' : ''}${rowDisabled ? ' is-row-disabled' : ''}`}
            >
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                checked={checked}
                disabled={rowDisabled}
                onChange={() => toggle(opt.value)}
              />
              <span className="msel-check" aria-hidden="true" />
              <span className="msel-label">
                <span>{opt.label}</span>
                {opt.sublabel && <span className="msel-sub">{opt.sublabel}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {(max || selected.size > 0) && (
        <div className="msel-count">
          {selected.size} selected{max ? ` (max ${max})` : ''}
        </div>
      )}
    </div>
  );
}
