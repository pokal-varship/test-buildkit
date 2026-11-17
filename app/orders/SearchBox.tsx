import CrossIcon from '@components/icons/CrossIcon';
import Icon from '@components/image/Icons';
import { CLOSE_CIRCLE_ICON, CROSS_ICON, FILTER_ICON, FILTER_ICON_WHITE, MENU_SEARCH_ICON, SEARCH_ICON } from '@config/Header/image.config';
import { cn } from '@lib/utils';
import { useTheme } from 'context/ThemeProvider';
import React, { useEffect, useRef, useState } from 'react'

interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterIconClick?: () => void;
  showFilterIcon?: boolean;
  isFilterActive?: boolean;
  showFilterClearIcon?: boolean;
  onFilterClearIconClick?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  filterContainerClassName?: string;
  filterIconClassName?: string;
  mainContainerClassName?: string;
  clearIconClassName?: string;
  onClearSearch?: () => void;
  /** When true (QR flow), show compact bar with title + icons; clicking search expands to full search box */
  isQrFlowMode?: boolean;
  /** Title shown on the left in QR flow compact bar (e.g. "My Orders") */
  title?: string;
  /** Hide filter and search actions in QR collapsed header */
  hideQrCollapsedActions?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Search',
  value,
  onChange,
  showFilterIcon = true,
  onFilterIconClick,
  isFilterActive,
  showFilterClearIcon = true,
  onFilterClearIconClick,
  mainContainerClassName,
  containerClassName,
  inputClassName,
  filterContainerClassName,
  filterIconClassName,
  clearIconClassName,
  onClearSearch,
  isQrFlowMode = false,
  title = '',
  hideQrCollapsedActions = false,
  ...inputProps
}) => {
    const { theme } = useTheme();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isQrFlowMode && isSearchExpanded && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isQrFlowMode, isSearchExpanded]);

    const filterClear = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onFilterClearIconClick?.();
    };

    const handleClearAndCollapse = () => {
      onClearSearch?.();
      if (isQrFlowMode) {
        setIsSearchExpanded(false);
      }
    };

    // QR flow: collapsed state — title left, filter + search icons right
    if (isQrFlowMode && !isSearchExpanded) {
      return (
        <div
          className={cn(
            "w-full flex items-center justify-between py-5 md:pb-0 gap-2 md:pt-7 md:px-5",
            mainContainerClassName
          )}
        >
          <h1 className="text-lg capitalize font-semibold text-[var(--primary-text)]">
            {title}
          </h1>
          {!hideQrCollapsedActions && (  
          <div className="flex items-center gap-2">
            {showFilterIcon && (
              <button
                type="button"
                className={cn(
                  "relative min-h-10 min-w-10 flex items-center justify-center p-1 text-[var(--primary-text)]",
                  filterContainerClassName
                )}
                onClick={onFilterIconClick}
              >
                <img
                  fetchPriority="high"
                  className={cn("", filterIconClassName)}
                  src={theme === "light" ? FILTER_ICON : FILTER_ICON_WHITE}
                  alt="Filter"
                  title="Filter"
                  width={24}
                  height={24}
                />
                {showFilterClearIcon && isFilterActive && (
                  <div
                    onClick={filterClear}
                    className={cn(
                      `absolute h-[21px] w-[21px] flex items-center justify-center -top-2 -right-2 bg-[var(--warning-light)] rounded-full`,
                      clearIconClassName
                    )}
                  >
                    <CrossIcon
                      height="10"
                      width="10"
                      pathFillColor="var(--white)"
                    />
                  </div>
                )}
              </button>
            )}
            <button
              type="button"
              className="min-h-10 min-w-10 flex items-center justify-center p-1 text-[var(--primary-text)]"
              onClick={() => setIsSearchExpanded(true)}
              aria-label="Search"
            >
              <Icon
                icon={`${MENU_SEARCH_ICON}#search-icon`}
                width={24}
                height={24}
                color="var(--primary-text)"
                className="search-icon"
                viewBox="0 0 22 20"
              />
            </button>
          </div>
          )}
        </div>
      );
    }

    // QR flow expanded: match mobilesearch UI — close (X) outside left, then search box with icon + input + clear when value
    if (isQrFlowMode && isSearchExpanded) {
      return (
        <div
          className={cn(
            "w-full flex items-center gap-3 py-5 md:pb-0 md:pt-7 md:px-5",
            mainContainerClassName
          )}
        >
          <button
            type="button"
            className="flex items-center justify-center shrink-0 cursor-pointer pr-1"
            onClick={handleClearAndCollapse}
            aria-label="Close search"
          >
            <Icon
              icon={`${CROSS_ICON}#cross`}
              width={15}
              height={15}
              color="var(--primary-text)"
              viewBox="0 0 18 18"
            />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2 rounded-[8px] border border-[var(--borders-dividers)] px-3 py-2 bg-[var(--cards-containers)]">
            <Icon
              icon={`${SEARCH_ICON}#search-icon`}
              width={20}
              height={20}
              color="var(--primary-text)"
              className="search-icon shrink-0 mt-[-5px]"
              viewBox="0 0 22 20"
            />
            <input
              ref={inputRef}
              type="text"
              className={cn(
                "flex-1 min-w-0 outline-none description-font bg-transparent border-none p-0",
                inputClassName
              )}
              placeholder="Search"
              value={value}
              onChange={onChange}
              {...inputProps}
            />
            {value ? (
              <Icon
                icon={`${CROSS_ICON}#cross`}
                width={16}
                height={16}
                color="var(--primary-text)"
                className="cursor-pointer shrink-0 p-[3px]"
                viewBox="0 0 16 16"
                onClick={onClearSearch}
              />
            ) : null}
          </div>
        </div>
      );
    }

    

  return (
    <div
      className={cn(
        "w-full flex items-center pb-5 md:pb-0 md:gap-5 gap-2 md:pt-7 md:px-4",
        mainContainerClassName
      )}
    >
      <div
        className={cn(
          "w-full h-12 flex items-center gap-2 rounded-[8px] border border-[var(--borders-dividers)] px-4 bg-[var(--cards-containers)]",
          containerClassName
        )}
      >
        <Icon
          icon={`${SEARCH_ICON}#search-icon`}
          width={20}
          height={20}
          color="var(--primary-text)"
          className="search-icon"
          viewBox="0 0 21 20"
        />
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "w-full h-full outline-none description-font bg-transparent",
            inputClassName
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...inputProps}
        />
        {value && (
          <Icon
            icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
            width={25}
            height={25}
            color="var(--primary-text)"
            className="cursor-pointer"
            viewBox="0 0 25 25"
            onClick={onClearSearch}
          />
        )}
      </div>
      {!isQrFlowMode && showFilterIcon && (
        <button
          className={cn(
            `min-h-12 max-h-12 relative min-w-12 max-w-12  flex items-center justify-center border ${
              isFilterActive
                ? "border-[var(--warning)]"
                : "border-[var(--borders-dividers)]"
            }  rounded-lg bg-[var(--cards-containers)] `,
            filterContainerClassName
          )}
          onClick={onFilterIconClick}
        >
          <img
            fetchPriority="high"
            className={cn("", filterIconClassName)}
            src={theme === "light" ? FILTER_ICON : FILTER_ICON_WHITE}
            alt="Filter drawer open"
            title="Filter drawer open"
            width={30}
            height={30}
          />
          {showFilterClearIcon && isFilterActive && (
            <div
              onClick={filterClear}
              className={cn(
                `absolute h-[21px] w-[21px] flex items-center justify-center -top-2 -right-2 bg-[var(--warning-light)] rounded-full`,
                clearIconClassName
              )}
            >
              <CrossIcon
                height="10"
                width="10"
                pathFillColor="var(--white)"
              />
            </div>
          )}
        </button>
      )}
    </div>
  );
}

export default SearchBox