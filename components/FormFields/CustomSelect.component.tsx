import React from "react";
import Select from "react-select";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: Option | null;
  onChange: (selectedOption: Option | null) => void;
  placeholder?: string;
  title?: string;
  isSearchable?: boolean;
  className?: string;
  error?: string;
  isMulti?: boolean;
  required?: boolean;
  loadMore?: any;
  borderRadius?: number;
  menuOpen?: any;
  disabled?: boolean;
  isClearable?: boolean;
}

const CustomSelect = (props: SelectProps) => {
  const {
    borderRadius,
    disabled,
    options,
    value,
    onChange,
    placeholder = "Select...",
    title,
    isSearchable = true,
    className,
    error,
    isMulti,
    required,
    loadMore,
    menuOpen,
    isClearable,
  } = props;
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderColor: error ? "red" : provided.borderColor,
      boxShadow: error ? "0 0 0 0.1 red" : provided.boxShadow,
      "&:hover": {
        borderColor: error ? "red" : provided.borderColor,
      },
      borderRadius: borderRadius ? borderRadius : "5px",
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <label className="block text-sm font-bold">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="">
        <Select
          isDisabled={disabled}
          placeholder={placeholder}
          options={options}
          value={value}
          onChange={onChange}
          isSearchable={isSearchable}
          isMulti={isMulti}
          isClearable={isClearable ? isClearable : true}
          styles={customStyles}
          onMenuOpen={() => menuOpen && menuOpen(true)}
          onMenuClose={() => menuOpen && menuOpen(false)}
          className={`react-select   ${className} ${
            error ? "border-red-500" : ""
          }`} // Add conditional styling for error
          // classNamePrefix="react-select" // Adds a prefix for custom styles
          // styles={{
          //     menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          //     menu: (base) => ({ ...base, zIndex: 9999 }),
          // }}
          onMenuScrollToBottom={loadMore}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default CustomSelect;
