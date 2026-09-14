import type { ReactNode } from "react";

type EntityListToolbarProps = {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  children?: ReactNode;
};

function EntityListToolbar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  children,
}: EntityListToolbarProps) {
  return (
    <div className="du-list-toolbar">
      <div className="du-search-box du-list-toolbar-search">
        {!searchValue && (
          <span className="du-search-icon" aria-hidden="true">
            ⌕
          </span>
        )}

        <input
          className="du-search-input"
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
        />
      </div>

      {children && <div className="du-list-toolbar-actions">{children}</div>}
    </div>
  );
}

export default EntityListToolbar;
