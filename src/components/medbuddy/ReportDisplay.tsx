import type { Report } from "@/lib/types";
import { ReportSection } from "./ReportSection";
import { MedicationTable } from "./MedicationTable";
import { ComparisonTable } from "./ComparisonTable";
import { VoiceOutputPlayer } from "./VoiceOutputPlayer";
import { Button } from "../ui/button";
import { Download, FilePlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
}

export function ReportDisplay({ report, extractedText, audioDataUri }: ReportDisplayProps) {
  const { toast } = useToast();

  const downloadReportAsPdf = () => {
    try {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        const addSection = (title: string, content: () => void, isLast = false) => {
            const contentHeight = pageHeight - 40;
            if (y > contentHeight) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 15, y);
            y += 2;
            doc.setDrawColor(220, 220, 220);
            doc.line(15, y, 195, y);
            y += 8;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            content();
            if (!isLast) {
              y += 5;
            }
        };

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Your Simplified Report', 105, y, { align: 'center' });
        y += 20;

        addSection('One-line Family Summary', () => {
            doc.setFont('helvetica', 'italic');
            const text = `"${report.family_summary}"`;
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 15, y);
            y += (splitText.length * 5) + 5;
        });
        
        addSection('Plain-language Diagnosis', () => {
            const text = report.plain_language_diagnosis;
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 15, y);
            y += (splitText.length * 5) + 5;
        });

        addSection('Medication Schedule', () => {
            if (report.medication_schedule.length > 0) {
                autoTable(doc, {
                    startY: y,
                    head: [['Medicine', 'Dosage', 'Timing', 'Duration']],
                    body: report.medication_schedule.map(med => [med.medicine_name, med.dosage, med.timing, med.days]),
                    theme: 'striped',
                    headStyles: { fillColor: [46, 115, 184] }, // primary color
                    didDrawPage: (data) => {
                        y = data.cursor?.y ?? 0;
                    }
                });
                y = (doc as any).lastAutoTable.finalY + 10;
            } else {
                doc.text('No medication schedule found in the document.', 15, y);
                y += 10;
            }
        });

        addSection('Follow-up Checklist', () => {
             if (report.follow_up_checklist.length > 0 && report.follow_up_checklist[0] !== "Not clearly mentioned in the document.") {
                report.follow_up_checklist.forEach(item => {
                    const splitText = doc.splitTextToSize(`• ${item}`, 175);
                    doc.text(splitText, 15, y);
                    y+= (splitText.length * 5) + 2;
                });
             } else {
                doc.text('No follow-up instructions found.', 15, y);
                y+=10;
             }
        });

        addSection('Side Effect Alerts', () => {
            if (report.side_effect_alerts.length > 0 && report.side_effect_alerts[0] !== "Not clearly mentioned in the document.") {
                 report.side_effect_alerts.forEach(alert => {
                    const splitText = doc.splitTextToSize(`• ${alert}`, 175);
                    doc.text(splitText, 15, y);
                    y += (splitText.length * 5) + 2;
                });
            } else {
                 doc.text('No side effects were explicitly mentioned in the document.', 15, y);
                 y+=10;
            }
        });

        addSection('Original vs. Simple Explanation', () => {
             if (report.comparison.length > 0) {
                autoTable(doc, {
                    startY: y,
                    head: [['Original Medical Term', 'Simple Explanation']],
                    body: report.comparison.map(item => [item.original, item.simple]),
                    theme: 'grid',
                    headStyles: { fillColor: [46, 115, 184] }, // primary color
                     didDrawPage: (data) => {
                        y = data.cursor?.y ?? 0;
                    }
                });
                 y = (doc as any).lastAutoTable.finalY + 10;
            } else {
                doc.text('No specific medical terms were simplified.', 15, y);
                y+=10;
            }
        });
        
        addSection('Extracted Original Text', () => {
             const text = extractedText;
             const splitText = doc.splitTextToSize(text, 180);
             doc.setFont('courier', 'normal');
             doc.setFontSize(8);
             doc.text(splitText, 15, y);
             y += (splitText.length * 3) + 5;
        }, true);


        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        doc.save(`medicare-report-${timestamp}.pdf`);

        toast({
            title: "Report Downloaded",
            description: "Your report has been downloaded as a PDF file.",
        });

    } catch (error) {
        console.error("Failed to download PDF report:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "There was an issue preparing your report for download.",
        });
    }
  };

  const handleStartNew = () => {
    window.location.href = '/';
  };


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Your Simplified Report</h2>
        <p className="text-muted-foreground mt-2">Here is the analysis of your medical document.</p>
      </div>

       <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={downloadReportAsPdf}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
        <Button onClick={handleStartNew} variant="outline">
          <FilePlus className="mr-2 h-4 w-4" />
          Start New Upload
        </Button>
      </div>
      
      <div className="space-y-6">
        <ReportSection title="One-line Family Summary">
          <p className="italic text-lg">"{report.family_summary}"</p>
        </ReportSection>

        {audioDataUri && (
          <ReportSection title="Voice Summary">
              <VoiceOutputPlayer audioDataUri={audioDataUri} />
          </ReportSection>
        )}
        
        <ReportSection title="Plain-language Diagnosis">
          <p>{report.plain_language_diagnosis}</p>
        </ReportSection>

        <ReportSection title="Medication Schedule">
          {report.medication_schedule.length > 0 ? (
            <MedicationTable medications={report.medication_schedule} />
          ) : (
            <p className="text-muted-foreground">No medication schedule found in the document.</p>
          )}
        </ReportSection>

        <ReportSection title="Follow-up Checklist">
          {report.follow_up_checklist.length > 0 && report.follow_up_checklist[0] !== "Not clearly mentioned in the document." ? (
            <ul className="list-disc list-inside space-y-1">
              {report.follow_up_checklist.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No follow-up instructions found.</p>
          )}
        </ReportSection>
        
        <ReportSection title="Side Effect Alerts">
          {report.side_effect_alerts.length > 0 && report.side_effect_alerts[0] !== "Not clearly mentioned in the document." ? (
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

        <ReportSection title="Original vs. Simple Explanation">
          {report.comparison.length > 0 ? (
            <ComparisonTable comparisons={report.comparison} />
          ) : (
             <p className="text-muted-foreground">No specific medical terms were simplified.</p>
          )}
        </ReportSection>
        
        <ReportSection title="Extracted Original Text">
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
      </div>

    </div>
  );
}
