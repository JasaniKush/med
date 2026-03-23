'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "./LanguageSelector";
import { OUTPUT_LANGUAGES, VOICE_LANGUAGES } from "@/lib/constants";
import { Upload, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadFormProps {
  isPending: boolean;
}

export function FileUploadForm({ isPending }: FileUploadFormProps) {
    const [fileName, setFileName] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("");
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const input = document.getElementById('file-upload') as HTMLInputElement;
            if (input) {
                input.files = files;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        }
    };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload" className="text-lg font-medium">Upload Document</Label>
        <p className="text-sm text-muted-foreground">
          Upload a PDF, PNG, or JPG file (max 5MB).
        </p>
        <div className="relative">
            <Input id="file-upload" name="document" type="file" required className="hidden" onChange={handleFileChange} accept="application/pdf,image/png,image/jpeg" />
            <Label 
                htmlFor="file-upload" 
                className={cn(
                    "flex flex-col items-center justify-center w-full h-40 px-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "hover:border-primary/70 hover:bg-secondary/50"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {fileName ? (
                    <>
                        <FileText className="h-10 w-10 text-primary mb-2" />
                        <span className="text-foreground font-medium">{fileName}</span>
                        <span className="text-muted-foreground text-xs mt-1">Click or drag another file to replace</span>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-muted-foreground">Click to upload or drag & drop</span>
                        <span className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (up to 5MB)</span>
                    </div>
                )}
            </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="patient-age">Patient Age (Optional)</Label>
          <Input id="patient-age" name="patientAge" type="number" placeholder="e.g., 45" min="0" />
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

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isPending}>
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
