import { useEffect, type RefObject } from "react";

/**
 * Calls `onClickOutside` when a click lands outside every ref in the list.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClickOutside: () => void
) {
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(target)
      );
      if (isOutside) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [refs, onClickOutside]);
}
