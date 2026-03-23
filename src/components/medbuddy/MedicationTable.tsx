import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Report } from "@/lib/types";

interface MedicationTableProps {
  medications: Report['medication_schedule'];
}

export function MedicationTable({ medications }: MedicationTableProps) {
  return (
    <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{med.medicine_name}</TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>{med.timing}</TableCell>
                <TableCell>{med.days}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
