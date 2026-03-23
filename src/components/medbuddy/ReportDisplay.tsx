import type { Report } from "@/lib/types";
import { ReportSection } from "./ReportSection";
import { MedicationTable } from "./MedicationTable";
import { ComparisonTable } from "./ComparisonTable";
import { VoiceOutputPlayer } from "./VoiceOutputPlayer";
import { Button } from "../ui/button";
import { Download, Save, FilePlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ReportDisplayProps {
  report: Report;
  extractedText: string;
  audioDataUri: string;
  onStartNew: () => void;
}

export function ReportDisplay({ report, extractedText, audioDataUri, onStartNew }: ReportDisplayProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Saving reports will be available after optional login.",
    });
  };

   const handleDownload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Downloading reports will be implemented in a future version.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Your Simplified Report</h2>
        <p className="text-muted-foreground mt-2">Here is the analysis of your medical document.</p>
      </div>

       <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
        <Button onClick={handleSave} variant="secondary">
          <Save className="mr-2 h-4 w-4" />
          Save Report
        </Button>
        <Button onClick={onStartNew} variant="outline">
          <FilePlus className="mr-2 h-4 w-4" />
          Start New Upload
        </Button>
      </div>
      
      <div className="space-y-6">
        <ReportSection title="8. Voice Summary">
            <VoiceOutputPlayer audioDataUri={audioDataUri} />
        </ReportSection>
        
        <ReportSection title="1. Extracted Original Text">
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Click to view original text</AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 bg-secondary/50 rounded-md max-h-60 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{extractedText}</pre>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </ReportSection>

        <ReportSection title="2. Plain-language Diagnosis">
          <p>{report.plain_language_diagnosis}</p>
        </ReportSection>

        <ReportSection title="3. Medication Schedule">
          {report.medication_schedule.length > 0 ? (
            <MedicationTable medications={report.medication_schedule} />
          ) : (
            <p className="text-muted-foreground">No medication schedule found in the document.</p>
          )}
        </ReportSection>

        <ReportSection title="4. Side Effect Alerts">
          {report.side_effect_alerts.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {report.side_effect_alerts.map((alert, index) => (
                <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-destructive flex-shrink-0" />
                    <span>{alert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No side effects were explicitly mentioned in the document.</p>
          )}
        </ReportSection>

        <ReportSection title="5. Follow-up Checklist">
          {report.follow_up_checklist.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {report.follow_up_checklist.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No follow-up instructions found.</p>
          )}
        </ReportSection>

        <ReportSection title="6. One-line Family Summary">
          <p className="italic">"{report.family_summary}"</p>
        </ReportSection>

        <ReportSection title="7. Original vs. Simple Explanation">
          {report.comparison.length > 0 ? (
            <ComparisonTable comparisons={report.comparison} />
          ) : (
             <p className="text-muted-foreground">No specific medical terms were simplified.</p>
          )}
        </ReportSection>
      </div>

    </div>
  );
}
