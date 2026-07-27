import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationOption {
  name: string;
  country: string;
  price: number;
  image?: string;
  slug: string;
}

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (destination: DestinationOption) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const DESTINATIONS: DestinationOption[] = [
  { name: "Londýn", country: "Velká Británie", price: 733, slug: "london-united-kingdom" },
  { name: "Paříž", country: "Francie", price: 1027, slug: "paris-france" },
  { name: "Řím", country: "Itálie", price: 712, slug: "rome-italy" },
  { name: "Barcelona", country: "Španělsko", price: 746, slug: "barcelona-spain" },
  { name: "New York", country: "USA", price: 7490, slug: "new-york-city-new-york-united-states" },
  { name: "Dubaj", country: "SAE", price: 5183, slug: "dubai-united-arab-emirates" },
  { name: "Amsterdam", country: "Nizozemsko", price: 1150, slug: "amsterdam-netherlands" },
  { name: "Bangkok", country: "Thajsko", price: 12390, slug: "bangkok-thailand" },
  { name: "Lisabon", country: "Portugalsko", price: 890, slug: "lisbon-portugal" },
  { name: "Miláno", country: "Itálie", price: 890, slug: "milan-italy" },
  { name: "Miami", country: "USA", price: 9490, slug: "miami-florida-united-states" },
  { name: "Malaga", country: "Španělsko", price: 890, slug: "malaga-spain" },
  { name: "Bali", country: "Indonésie", price: 12790, slug: "bali-indonesia" },
  { name: "Santorini", country: "Řecko", price: 1791, slug: "santorini-greece" },
  { name: "Hanoj", country: "Vietnam", price: 7990, slug: "hanoi-vietnam" },
  { name: "Neapol", country: "Itálie", price: 790, slug: "naples-italy" },
  { name: "Palma de Mallorca", country: "Španělsko", price: 990, slug: "palma-mallorca-spain" },
  { name: "Zadar", country: "Chorvatsko", price: 690, slug: "zadar-croatia" },
  { name: "Cancún", country: "Mexiko", price: 10990, slug: "cancun-mexico" },
  { name: "Havana", country: "Kuba", price: 11990, slug: "havana-cuba" },
  { name: "Male", country: "Maledivy", price: 14990, slug: "male-maldives" },
  { name: "Abu Dhabi", country: "SAE", price: 5490, slug: "abu-dhabi-united-arab-emirates" },
  { name: "Marakéš", country: "Maroko", price: 1426, slug: "marrakesh-morocco" },
  { name: "Island", country: "Island", price: 1460, slug: "reykjavik-iceland" },
];

const TOP_DESTINATIONS = DESTINATIONS.slice(0, 8);

export default function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Kam letíte? (např. Paříž, Londýn...)",
  className,
  inputClassName,
}: DestinationAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!value || value.length < 1) return DESTINATIONS;
    const lower = value.toLowerCase();
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.country.toLowerCase().includes(lower)
    );
  }, [value]);

  const handleSelect = (dest: DestinationOption) => {
    onChange(dest.name);
    onSelect(dest);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={cn(
              "pl-9 h-12 w-full rounded-md border-2 border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]",
              inputClassName
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-xl border-gray-200"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandList>
            <CommandEmpty className="py-4 text-gray-500 text-sm">
              Nenalezeno. Zadejte jinou destinaci.
            </CommandEmpty>
            {value.length < 1 ? (
              <CommandGroup heading="Nejžádanější destinace">
                {TOP_DESTINATIONS.map((dest) => (
                  <CommandItem
                    key={dest.slug}
                    value={dest.name}
                    onSelect={() => handleSelect(dest)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-[#1565C0] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800">{dest.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{dest.country}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                      od {dest.price.toLocaleString("cs-CZ")} Kč
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup heading={`Destinace (${filtered.length})`}>
                {filtered.map((dest) => (
                  <CommandItem
                    key={dest.slug}
                    value={dest.name}
                    onSelect={() => handleSelect(dest)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-[#1565C0] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800">{dest.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{dest.country}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                      od {dest.price.toLocaleString("cs-CZ")} Kč
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}