'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "./LanguageSelector";
import { OUTPUT_LANGUAGES, VOICE_LANGUAGES } from "@/lib/constants";
import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";

interface FileUploadFormProps {
  isPending: boolean;
}

export function FileUploadForm({ isPending }: FileUploadFormProps) {
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("");
        }
    };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload" className="text-lg font-medium">Upload Document</Label>
        <p className="text-sm text-muted-foreground">
          Upload a PDF or image of your prescription or medical report.
        </p>
        <div className="relative">
            <Input id="file-upload" name="document" type="file" required className="hidden" onChange={handleFileChange} />
            <Label htmlFor="file-upload" className="flex items-center justify-center w-full h-32 px-4 text-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                {fileName ? (
                    <span className="text-foreground">{fileName}</span>
                ) : (
                    <span className="text-muted-foreground">Click or drag file to this area to upload</span>
                )}
            </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patient-age">Patient Age (Optional)</Label>
          <Input id="patient-age" name="patientAge" type="number" placeholder="e.g., 45" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="output-language">Output Language</Label>
          <LanguageSelector
            id="output-language"
            name="outputLanguage"
            languages={OUTPUT_LANGUAGES}
            defaultValue="English"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voice-language">Voice Language</Label>
          <LanguageSelector
            id="voice-language"
            name="voiceLanguage"
            languages={VOICE_LANGUAGES}
            defaultValue="en"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Analyzing..." : "Generate Report"}
      </Button>
    </div>
  );
}
