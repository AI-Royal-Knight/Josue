"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export type SelectOption = {
    label: string;
    value: string;
};

type SelectSearchProps = {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    label?: string;
    className?: string;
};

export default function SelectSearch({
    options,
    value: controlledValue,
    onChange,
    placeholder = "Select an option",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    label,
    className,
}: SelectSearchProps) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState("");

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleSelect = (selected: string) => {
        const next = selected === value ? "" : selected;
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
        setOpen(false);
    };

    return (
        <div className={cn("*:not-first:mt-1.5", className)}>
            {label && <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>}
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={open}
                        className="w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
                        id={id}
                        role="combobox"
                        variant="outline"
                    >
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value
                                ? options.find((o) => o.value === value)?.label
                                : placeholder}
                        </span>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="shrink-0 text-muted-foreground/80"
                            size={16}
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
                >
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={handleSelect}
                                        value={option.value}
                                    >
                                        {option.label}
                                        {value === option.value && (
                                            <CheckIcon className="ml-auto" size={16} />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
