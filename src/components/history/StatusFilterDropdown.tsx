// king-bites-pos/src/app/(admin)/orders/components/StatusFilterDropdown.tsx

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Filter } from "lucide-react";

interface StatusOption {
  label: string;
  value: string;
  backendValue?: string;
}

interface StatusFilterDropdownProps {
  statusOptions: StatusOption[];
  statusFilter: string;
  onStatusSelect: (status: string) => void;
}

export default function StatusFilterDropdown({
  statusOptions,
  statusFilter,
  onStatusSelect,
}: StatusFilterDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status: string) => {
    onStatusSelect(status);
    setIsDropdownOpen(false); 
  };

  const selectedOption = statusOptions.find(
    (opt) => opt.value === statusFilter
  );

  return (
    <div className="relative w-full sm:w-40" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-auto p-2.5 px-4 flex items-center rounded-xl bg-white text-slate-700 font-medium transition hover:bg-gray-50 active:bg-gray-100"
      >
        <Filter className="w-8 h-4 -ml-4 text-slate-400" />
        <span className="truncate text-base -mr-4">
          {selectedOption?.label || "All"}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-7 text-slate-400 transition-transform ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 z-20 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1"
          style={{ top: "100%" }} 
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                statusFilter === option.value
                  ? "bg-sky-50 text-sky-700 font-semibold" 
                  : "text-slate-700 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}