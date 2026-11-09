'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export default function TeamAccessSelect({ label, initial, options, name = 'role' }: {
  label: string;
  name?: string;
  initial: string;
  options: [string, string][];
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState(initial);
  const [active, setActive] = useState<number | null>(null);
  const selected = options.findIndex(([key]) => key === value);

  useEffect(() => {
    if (active === null) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [active]);

  function choose(index: number) {
    setValue(options[index][0]);
    setActive(null);
    trigger.current?.focus();
  }

  return <div className="team-access-select" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
  }}>
    <input type="hidden" name={name} value={value} />
    <button type="button" ref={trigger} role="combobox" aria-label={label} aria-controls={id}
      aria-expanded={active !== null} aria-activedescendant={active === null ? undefined : id + '-' + active}
      className="team-access-trigger" onClick={() => setActive(active === null ? Math.max(selected, 0) : null)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const step = event.key === 'ArrowDown' ? 1 : -1;
          setActive(active === null ? Math.max(selected, 0) : Math.min(options.length - 1, Math.max(0, active + step)));
        } else if (active !== null && (event.key === 'Home' || event.key === 'End')) {
          event.preventDefault();
          setActive(event.key === 'Home' ? 0 : options.length - 1);
        } else if (active !== null && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          choose(active);
        } else if (event.key === 'Escape' && active !== null) {
          event.preventDefault();
          setActive(null);
        }
      }}>
      <span>{options[selected]?.[1] ?? label}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    <ul id={id} role="listbox" aria-label={label} hidden={active === null}>
      {options.map(([key, name], index) => <li key={key} id={id + '-' + index} role="option"
        aria-selected={value === key} data-active={index === active}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()}
        onClick={() => choose(index)}>
        <span>{name}</span>{value === key && <Check size={15} aria-hidden="true" />}
      </li>)}
    </ul>
  </div>;
}
