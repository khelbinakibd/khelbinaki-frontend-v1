import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useDropdownMenu } from "./useDropdownMenu";

import { HALF_HOUR_TIMES } from "./timeOptions";

export default function TimeDropdown({ id, value, onChange, disabled, invalid }: {
  id: string; value: string; onChange: (value: string) => void; disabled: boolean; invalid: boolean;
}) {
  const menuId = useId();
  const trigger = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const expanded = open && !disabled;
  const close = useCallback(() => { setOpen(false); setActive(null); }, []);
  const position = useDropdownMenu(expanded, trigger, menu, close);
  useEffect(() => {
    if (expanded && active !== null) menu.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [expanded, active]);
  function choose(index: number) {
    onChange(HALF_HOUR_TIMES[index]);
    close();
    input.current?.focus();
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "Tab") close();
    else if (event.key === "Enter" && expanded && active !== null) { event.preventDefault(); choose(active); }
    else if (event.key === "ArrowDown" || event.key === "ArrowUp" || (expanded && (event.key === "Home" || event.key === "End") && active !== null)) {
      event.preventDefault();
      setOpen(true);
      setActive(current => current === null ? Math.max(0, HALF_HOUR_TIMES.indexOf(value))
        : event.key === "Home" ? 0 : event.key === "End" ? 47
        : Math.max(0, Math.min(47, current + (event.key === "ArrowDown" ? 1 : -1))));
    }
  }
  return <>
    <div ref={trigger} className="flex items-center w-full border-2 border-gray-200 rounded-xl bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 has-disabled:opacity-50">
      <input ref={input} id={id} type="text" role="combobox" value={value} required disabled={disabled}
        placeholder="HH:mm" maxLength={5} pattern="([01][0-9]|2[0-3]):[0-5][0-9]" autoComplete="off"
        aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined}
        aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded ? menuId : undefined} aria-autocomplete="none"
        aria-activedescendant={expanded && active !== null ? `${menuId}-${active}` : undefined}
        onKeyDown={keyDown} onClick={() => setOpen(true)}
        onChange={event => { onChange(event.target.value); setActive(null); }}
        onBlur={event => { if (!trigger.current?.contains(event.relatedTarget)) close(); }}
        className="min-w-0 w-full px-4 py-2.5 rounded-xl outline-none text-sm bg-transparent disabled:cursor-not-allowed" />
      <button type="button" disabled={disabled} aria-label={`Show ${id === "maintenance-start" ? "start" : "end"} time suggestions`}
        aria-expanded={expanded} aria-controls={expanded ? menuId : undefined}
        onMouseDown={event => event.preventDefault()} onClick={() => { setOpen(current => !current); input.current?.focus(); }}
        onBlur={event => { if (!trigger.current?.contains(event.relatedTarget)) close(); }}
        className="mr-2 p-1.5 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed">
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </div>
    {expanded && createPortal(<div ref={menu} id={menuId} role="listbox" aria-label="Time suggestions in 24-hour format"
      style={position} className="fixed z-50 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg text-sm">
      {HALF_HOUR_TIMES.map((time, index) => <div key={time} id={`${menuId}-${index}`} role="option" aria-selected={value === time}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 cursor-pointer ${index === active ? "bg-emerald-50 text-emerald-800" : "text-gray-700 hover:bg-emerald-50"} ${value === time ? "font-medium text-emerald-700" : ""}`}>
        <span>{time}</span>{value === time && <Check size={16} aria-hidden="true" />}
      </div>)}
    </div>, document.body)}
  </>;
}
