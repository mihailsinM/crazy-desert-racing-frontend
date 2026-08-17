import { useEffect, useRef, useState } from "react";

export type DesertLiveFilterOption<T extends string> = {
  value: T;
  label: string;
  icon: string;
};

type DesertLiveMenuFilterProps<T extends string> = {
  buttonLabel: string;
  menuLabel: string;
  value: T;
  options: readonly DesertLiveFilterOption<T>[];
  onChange: (value: T) => void;
};

function DesertLiveMenuFilter<T extends string>({
  buttonLabel,
  menuLabel,
  value,
  options,
  onChange,
}: DesertLiveMenuFilterProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectOption(optionValue: T) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="du-dashboard-filter">
      <button
        type="button"
        className="du-button du-button-small du-button-rect du-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">⏷</span>
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="du-filter-menu" role="menu" aria-label={menuLabel}>
          <div className="du-filter-menu-header">
            <span>{menuLabel}</span>
            <strong>{activeOption?.label}</strong>
          </div>

          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={
                  isActive
                    ? "du-filter-option du-filter-option-active"
                    : "du-filter-option"
                }
                onClick={() => selectOption(option.value)}
              >
                <span className="du-filter-option-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span>{option.label}</span>
                {isActive && (
                  <span className="du-filter-option-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DesertLiveMenuFilter;
