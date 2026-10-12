import { useEffect, useState } from "react";
import type { RefObject } from "react";

// Shared portal positioning and outside-click behavior for maintenance selectors.
export function useDropdownMenu(expanded: boolean, trigger: RefObject<HTMLElement | null>, menu: RefObject<HTMLDivElement | null>, close: () => void) {
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 240 });
  useEffect(() => {
    if (!expanded) return;
    function positionMenu() {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const height = Math.min(240, Math.max(below, above));
      const width = Math.min(rect.width, window.innerWidth - 16);
      setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        top: below >= Math.min(240, above) ? rect.bottom + 4 : Math.max(8, rect.top - height - 4),
        width, maxHeight: height });
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !trigger.current?.contains(event.target) && !menu.current?.contains(event.target)) close();
    }
    positionMenu();
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [expanded, trigger, menu, close]);
  return position;
}
