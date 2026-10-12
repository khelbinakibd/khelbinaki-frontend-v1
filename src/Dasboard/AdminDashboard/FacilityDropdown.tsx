import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useDropdownMenu } from "./useDropdownMenu";
import type { Facility } from "../../types/api.types";

export default function FacilityDropdown({ facilities, value, onChange, disabled, loading }: {
  facilities: Facility[]; value: string; onChange: (id: string) => void; disabled: boolean; loading: boolean;
}) {
  const menuId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const expanded = open && !disabled && !loading;
  const selected = facilities.find(facility => facility._id === value);
  const close = useCallback(() => setOpen(false), []);
  const position = useDropdownMenu(expanded, trigger, menu, close);
  useEffect(() => {
    if (expanded) menu.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, expanded]);

  function choose(index: number) {
    if (facilities[index]) onChange(facilities[index]._id);
    setOpen(false);
    trigger.current?.focus();
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!expanded) {
        setActive(Math.max(0, facilities.findIndex(facility => facility._id === value)));
        setOpen(true);
      } else if (event.key === "Enter" || event.key === " ") choose(active);
      else setActive(current => event.key === "Home" ? 0 : event.key === "End" ? facilities.length - 1
        : Math.max(0, Math.min(facilities.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const index = facilities.findIndex((facility, index) => index > active && facility.name.toLowerCase().startsWith(event.key.toLowerCase()));
      const match = index >= 0 ? index : facilities.findIndex(facility => facility.name.toLowerCase().startsWith(event.key.toLowerCase()));
      if (match >= 0) { setActive(match); setOpen(true); }
    }
  }
  return <>
    <button ref={trigger} id="maintenance-facility" type="button" role="combobox" aria-haspopup="listbox"
      aria-expanded={expanded} aria-controls={expanded ? menuId : undefined} aria-autocomplete="none"
      aria-labelledby="maintenance-facility-label" aria-busy={loading}
      aria-activedescendant={expanded && facilities[active] ? `${menuId}-${facilities[active]._id}` : undefined}
      disabled={disabled || loading || facilities.length === 0} onKeyDown={keyDown}
      onClick={() => { setActive(Math.max(0, facilities.findIndex(facility => facility._id === value))); setOpen(current => !current); }}
      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none text-sm bg-white text-left disabled:opacity-50 disabled:cursor-not-allowed">
      <span className="truncate">{loading ? "Loading facilities…" : selected ? `${selected.name}${selected.isActive ? "" : " (Inactive)"}` : facilities.length ? "Select a facility" : "No facilities available"}</span>
      <ChevronDown size={16} className="shrink-0 text-gray-500" aria-hidden="true" />
    </button>
    {expanded && createPortal(<div ref={menu} id={menuId} role="listbox" aria-labelledby="maintenance-facility-label"
      style={position} className="fixed z-50 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg text-sm">
      {facilities.map((facility, index) => <div key={facility._id} id={`${menuId}-${facility._id}`} role="option"
        aria-selected={value === facility._id} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()}
        onClick={() => choose(index)} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 cursor-pointer ${index === active ? "bg-emerald-50 text-emerald-800" : "text-gray-700 hover:bg-emerald-50"} ${value === facility._id ? "font-medium text-emerald-700" : ""}`}>
        <span>{facility.name}{facility.isActive ? "" : " (Inactive)"}</span>
        {value === facility._id && <Check size={16} className="shrink-0" aria-hidden="true" />}
      </div>)}
    </div>, document.body)}
  </>;
}
