import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from "@/lib/types";

interface LanguageSelectorProps {
  id: string;
  name: string;
  languages: Language[];
  defaultValue: string;
}

export function LanguageSelector({ id, name, languages, defaultValue }: LanguageSelectorProps) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
