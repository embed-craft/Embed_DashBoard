import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (value: string) => {
        onChange(selected.filter((s) => s !== value));
    };

    const handleSelect = (value: string) => {
        setInputValue("");
        if (selected.includes(value)) {
            handleUnselect(value);
        } else {
            onChange([...selected, value]);
        }
    };

    const selectedOptions = selected.map((s) => options.find((o) => o.value === s) || { label: s, value: s });

    return (
        <Command className={`overflow-visible bg-transparent ${className}`}>
            <div
                className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => inputRef.current?.focus()}
            >
                <div className="flex gap-1 flex-wrap">
                    {selectedOptions.map((option) => (
                        <Badge key={option.value} variant="secondary">
                            {option.label}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(option.value);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option.value)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={selected.length === 0 ? placeholder : undefined}
                        className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[50px]"
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && !inputValue && selected.length > 0) {
                                handleUnselect(selected[selected.length - 1]);
                            }
                        }}
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && (
                    <div className="absolute top-0 w-full z-10 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-95">
                        <CommandList>
                            {options.length > 0 ? (
                                <CommandGroup className="h-full overflow-auto max-h-[200px]">
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                            onClick={() => handleSelect(option.value)} // Explicit click handler for safety
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : (
                                <p className="p-2 text-sm text-muted-foreground">No results found.</p>
                            )}
                        </CommandList>
                    </div>
                )}
            </div>
        </Command>
    );
}
