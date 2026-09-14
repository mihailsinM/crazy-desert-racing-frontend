import { useLayoutEffect, useRef, type ReactNode } from "react";

type AdaptiveCardListProps = {
  children: ReactNode;
  className?: string;
};

function boxHeight(element: Element) {
  const style = window.getComputedStyle(element);
  return (
    element.getBoundingClientRect().height +
    (Number.parseFloat(style.marginTop) || 0) +
    (Number.parseFloat(style.marginBottom) || 0)
  );
}

function AdaptiveCardList({ children, className = "" }: AdaptiveCardListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const overlay = list?.parentElement;
    if (!list || !overlay) return;

    let frame = 0;
    const observer = new ResizeObserver(() => schedule());

    function measure() {
      if (!list || !overlay) return;

      // On compact screens the whole card scrolls so tall rows never get cut.
      if (window.matchMedia("(max-width: 800px), (max-height: 560px)").matches) {
        list.style.height = "";
        return;
      }

      const overlayStyle = window.getComputedStyle(overlay);
      const listStyle = window.getComputedStyle(list);
      const padding =
        (Number.parseFloat(overlayStyle.paddingTop) || 0) +
        (Number.parseFloat(overlayStyle.paddingBottom) || 0);
      const otherContent = Array.from(overlay.children)
        .filter((element) => {
          if (element === list) return false;
          const position = window.getComputedStyle(element).position;
          return position !== "absolute" && position !== "fixed";
        })
        .reduce((height, element) => height + boxHeight(element), 0);
      const available = Math.max(0, overlay.clientHeight - padding - otherContent);
      const gap = Number.parseFloat(listStyle.rowGap) || 0;
      const rowHeight = Number.parseFloat(listStyle.getPropertyValue("--du-card-height")) || 0;
      const rows = Array.from(list.children);
      let visible = 0;
      let height = 0;

      for (const row of rows) {
        const next = rowHeight || row.getBoundingClientRect().height;
        if (visible > 0 && height + gap + next > available) break;
        if (visible === 0 && next > available) {
          height = available;
          break;
        }
        height += (visible ? gap : 0) + next;
        visible++;
      }

      // The list is also the scrollport: only complete rows occupy its height.
      // Empty states need at least one row's worth of space.
      list.style.height = `${Math.min(available, Math.max(height, rows.length ? 0 : Math.min(rowHeight, available)) + 2)}px`;
    }

    function schedule() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    }

    function observeContent() {
      observer.observe(overlay!);
      for (const element of overlay!.children) {
        if (element !== list) observer.observe(element);
      }
      schedule();
    }

    const mutation = new MutationObserver(observeContent);
    mutation.observe(overlay, { childList: true });
    mutation.observe(list, { childList: true });
    observeContent();
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={listRef} className={`du-card-list du-soft-scroll du-adaptive-card-list ${className}`}>
      {children}
    </div>
  );
}

export default AdaptiveCardList;
