import React from "react";
import { BsSearch } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    showClear?: boolean;
    onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Search...",
    className = "",
    autoFocus = false,
    disabled = false,
    showClear = true,
    onClear,
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(e);
    };

    const handleClear = () => {
        onChange("");
        onClear?.();
    };

    return (
        <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
            <div className="relative">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    className={`
                        w-full
                        pl-10 pr-4 py-2
                        bg-zinc-900
                        border border-zinc-800
                        rounded-lg
                        text-sm
                        text-zinc-100
                        placeholder:text-zinc-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-500/20
                        focus:border-cyan-500/20
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        transition-colors
                        duration-200
                    `}
                />
                {showClear && value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 focus:outline-none"
                    >
                        <RxCross1 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </form>
    );
};
