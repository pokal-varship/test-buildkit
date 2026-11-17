"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import Icon from "@components/image/Icons";
import { usePathname } from "next/navigation"; // Import usePathname
import { MENU_STORE_ICON } from "@config/Header/image.config";
import { cn } from "@lib/utils";

interface SearchInputProps {
  search?: boolean;
  location?: boolean;
  placeholder?: string;
  searchIcon?: string;
  locationIcon?: string;
  handleInputChange?: () => void;
  inputData?: string;
  handleInputDataChange?: (address: string) => void;
  suggestions?: string[] | { [key: string]: string }[];
  showDropdown?: boolean;
  handleSelect?: (suggestion: string | { [key: string]: string}) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  crossShow?: boolean;
  crossIcon?: string;
  crossIconColor?: string;
  clearOnUrlChange?: boolean;
  crossIconClassName?: string;
  inputClassName?: string;
  suggestionClassName?: string;
  width?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  search = true,
  location = true,
  placeholder = "",
  searchIcon = "",
  locationIcon = "",
  handleInputChange = () => {},
  inputData = "",
  handleInputDataChange = () => {},
  suggestions = [],
  showDropdown = false,
  handleSelect = () => {},
  onFocus = () => {},
  crossShow,
  crossIcon,
  crossIconColor,
  clearOnUrlChange = false,
  crossIconClassName = "",
  inputClassName = "",
  suggestionClassName = "",
  width = "100%"
}) => {

  // Local state for managing dropdown
  const [localInputValue, setLocalInputValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(showDropdown);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    string[] | { [key: string]: string }[]
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // Get the current pathname
  const inputRef = useRef<HTMLInputElement>(null);


  // Create a debounced version of handleInputDataChange
  const debouncedHandleInputDataChange = useCallback(debounce(handleInputDataChange, 400), [handleInputDataChange]);

  // Update filtered suggestions when input changes
  useEffect(() => {
    if (suggestions.length > 0)
      if (localInputValue.length >= 3) {
        const filtered = suggestions.filter((suggestion) => suggestion);
        setFilteredSuggestions(
          filtered as string[] | { [key: string]: string }[]
        );
      } else {
        setFilteredSuggestions([]);
      }
  }, [localInputValue, suggestions]);

  useEffect(() => {
    setLocalInputValue(inputData);
  }, [inputData]);

  // Reset input on pathname change
  useEffect(() => {
    if(clearOnUrlChange){
      setLocalInputValue("");
    }
  }, [pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string | { [key: string]: string}) => {
    setLocalInputValue(typeof suggestion === "object" ? suggestion?.title : suggestion);
    // handleInputDataChange(suggestion);
    handleSelect(suggestion as string | { [key: string]: string});
    setIsDropdownOpen(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    onFocus();
  };

  // Handle input change
  const handleInputChangeInternal = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setLocalInputValue(newValue);
    debouncedHandleInputDataChange(newValue);
  };

  const handleClearInput = () => {
    handleInputDataChange("");
    setLocalInputValue("");
    setFilteredSuggestions([]);
    inputRef.current?.focus();
  };

  const renderClearIcon = (extraClassName = "") =>
    crossIcon ? (
      <Icon
        icon={`${crossIcon}#cross`}
        width={20}
        height={20}
        color={crossIconColor || "var(--primary-text)"}
        className={cn("cursor-pointer", extraClassName)}
        viewBox="0 0 25 25"
        onClick={handleClearInput}
      />
    ) : null;

  return (
    <div className="address-input-container" ref={dropdownRef} style={{ width }}>
      {search && searchIcon && (
        <Icon
          icon={`${searchIcon}#search-icon`}
          width={24}
          height={24}
          color={"var(--primary-text)"}
          className="search-icon"
          viewBox="0 0 22 22"
        />
      )}

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={cn("address-input", inputClassName)}
        value={localInputValue}
        onChange={handleInputChangeInternal}
        onFocus={handleInputFocus}
      />

      {!location && localInputValue && crossShow && renderClearIcon()}

      {location && isDropdownOpen && filteredSuggestions.length > 0 && (
        <ul className="dropdown">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() =>
                handleSuggestionSelect(
                  suggestion as string | { [key: string]: string }
                )
              }
              className={cn("dropdown-item", suggestionClassName)}
            >
              <Icon
                icon={`${MENU_STORE_ICON}#store`}
                width={17}
                height={17}
                color="var(--secondary-text)"
                className="store-icon"
                viewBox="0 0 18 18"
              />
              {typeof suggestion === "object" ? suggestion?.title : suggestion}
            </li>
          ))}
        </ul>
      )}

      {location && (
        <span className={!localInputValue && locationIcon ? "icon" : ""}>
          {!localInputValue && locationIcon ? (
            <span onClick={() => {
              handleInputChange();
              setFilteredSuggestions([]);
            }}>
              <Icon
                icon={`${locationIcon}#location-icon`}
                width={24}
                height={24}
                color="var(--primary-icon-color)"
                className="cursor-pointer"
                viewBox="0 0 24 24"
              />
            </span>
          ) : null}
          {localInputValue && crossShow ? renderClearIcon(crossIconClassName) : null}
        </span>
      )}

      <style>{`
                .address-input-container {
                    display: flex;
                    align-items: center;
                    border: 1px solid var(--borders-dividers);
                    border-radius: 8px;
                    padding: 8px;
                    background-color: var(--cards-containers);
                    font-family: var(--font-family);
                    position: relative;
                    justify-self: end;
                }
                .address-input {
                    flex: 1;
                    padding: 0px 10px 0px 10px;
                    border: none;
                    outline: none;
                    color: var(--primary-text);
                    background-color: transparent;
                    font-family: var(--font-family);
                    font-size: var(--description-font);
                }
                .icon {
                    margin-left: 10px;
                    padding-left: 10px;
                    border-left: 1px solid var(--secondary-text);
                    cursor: pointer;
                }
                [dir="rtl"] .icon {
                    margin-left: 0;
                    padding-left: 0;
                    margin-right: 10px;
                    padding-right: 10px;
                    border-left: none;
                    border-right: 1px solid var(--secondary-text);
                }
                .location-icon {
                    width: 25px;
                    height: auto;
                }
                .search-icon {
                    width: 15px;
                    height: auto;
                    margin-right: 5px;
                    margin-top: -2px;
                }
                .address-input {
                    width: 100%;
                    border-radius: 8px;
                    outline: none;
                    border: none;
                    background: transparent;
                }
                .dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--cards-containers);
                    border: 1px solid var(--borders-dividers);
                    border-radius: 8px;
                    max-height: 150px;
                    overflow-y: auto;
                    z-index: 10;
                    margin-top: 5px;
                    padding: 0;
                }
                .dropdown-item {
                    padding: 8px;
                    cursor: pointer;
                    list-style: none;
                    color: var(--primary-text);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .dropdown-item:hover {
                    background-color: var(--hover-bg);
                }
                .store-icon {
                    flex-shrink: 0;
                }
            `}</style>
    </div>
  );
};
