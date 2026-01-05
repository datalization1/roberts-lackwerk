import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DamageReportInvoiceProps {
  damageReport: any;
  onBack: () => void;
}

export function DamageReportInvoice({ damageReport, onBack }: DamageReportInvoiceProps) {
  const [step, setStep] = useState<'edit' | 'preview' | 'sent'>('edit');
  const [invoiceNumber, setInvoiceNumber] = useState(`RE-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Parse the estimated cost from the damage report
  const estimatedAmount = parseFloat(damageReport.estimatedCost?.replace(/[^\d.-]/g, '') || '0');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: `Karosseriereparatur - ${damageReport.damageType}`,
      quantity: 1,
      unitPrice: estimatedAmount,
      total: estimatedAmount,
    }
  ]);
  const [notes, setNotes] = useState('Zahlbar innerhalb von 30 Tagen netto.\n\nVielen Dank für Ihr Vertrauen in unsere Dienstleistungen!');
  const [taxRate, setTaxRate] = useState(7.7);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const generatePDF = () => {
    // Import jsPDF dynamically
    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF();
        
        // Colors
        const primaryColor: [number, number, number] = [185, 28, 28]; // Red
        const textColor: [number, number, number] = [51, 51, 51];
        const lightGray: [number, number, number] = [245, 245, 245];
        
        // Header - Company Info
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('AutoRepair Pro', 20, 25);
        
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Musterstrasse 123', 20, 32);
        doc.text('8000 Zürich', 20, 37);
        doc.text('Schweiz', 20, 42);
        doc.text('Tel: +41 44 123 45 67', 20, 47);
        doc.text('info@autorepairpro.ch', 20, 52);
        
        // Invoice Title
        doc.setFontSize(20);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('RECHNUNG', 150, 25);
        
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rechnungsnr: ${invoiceNumber}`, 150, 35);
        doc.text(`Datum: ${invoiceDate}`, 150, 40);
        doc.text(`Fällig: ${dueDate}`, 150, 45);
        doc.text(`Schadenmeldung: ${damageReport.id}`, 150, 50);
        
        // Customer Address
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Rechnungsempfänger:', 20, 70);
        
        doc.setFont('helvetica', 'normal');
        doc.text(damageReport.customerName, 20, 77);
        doc.text(damageReport.vehicle || '', 20, 82);
        
        // Vehicle details if available
        if (damageReport.insuranceCompany) {
          doc.setFontSize(9);
          doc.text(`Versicherung: ${damageReport.insuranceCompany}`, 20, 90);
        }
        
        // Items Table
        const tableData = items.map(item => [
          item.description,
          item.quantity.toString(),
          `CHF ${item.unitPrice.toFixed(2)}`,
          `CHF ${item.total.toFixed(2)}`
        ]);
        
        (doc as any).autoTable({
          startY: 100,
          head: [['Beschreibung', 'Menge', 'Einzelpreis', 'Gesamt']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 9,
            textColor: textColor,
          },
          alternateRowStyles: {
            fillColor: lightGray,
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' },
          },
        });
        
        // Get final Y position after table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Summary Box
        const summaryX = 120;
        let summaryY = finalY;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Subtotal
        doc.text('Zwischensumme:', summaryX, summaryY);
        doc.text(`CHF ${subtotal.toFixed(2)}`, 185, summaryY, { align: 'right' });
        
        // Tax
        summaryY += 6;
        doc.text(`MwSt (${taxRate}%):`, summaryX, summaryY);
        doc.text(`CHF ${taxAmount.toFixed(2)}`, 185, summaryY, { align: 'right' });
        
        // Total
        summaryY += 8;
        doc.setDrawColor(...primaryColor);
        doc.line(summaryX, summaryY - 2, 190, summaryY - 2);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Gesamtbetrag:', summaryX, summaryY + 4);
        doc.text(`CHF ${total.toFixed(2)}`, 185, summaryY + 4, { align: 'right' });
        
        // Notes
        if (notes) {
          const notesY = summaryY + 20;
          doc.setFontSize(10);
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'bold');
          doc.text('Anmerkungen:', 20, notesY);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const splitNotes = doc.splitTextToSize(notes, 170);
          doc.text(splitNotes, 20, notesY + 6);
        }
        
        // Footer
        const footerY = 270;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, footerY, 190, footerY);
        
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.text('AutoRepair Pro GmbH | UID: CHE-123.456.789 | Bank: Zürcher Kantonalbank', 105, footerY + 5, { align: 'center' });
        doc.text('IBAN: CH93 0076 2011 6238 5295 7 | BIC: ZKBKCHZZ80A', 105, footerY + 9, { align: 'center' });
        
        // Save the PDF
        doc.save(`Rechnung_${invoiceNumber}_${damageReport.id}.pdf`);
      });
    });
  };

  const generateDOCX = () => {
    import('docx').then((docxModule) => {
      const { Document, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, BorderStyle } = docxModule;
      
      // Create table rows for items
      const itemRows = items.map(item => 
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: item.description })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.RIGHT })],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: `CHF ${item.unitPrice.toFixed(2)}`, alignment: AlignmentType.RIGHT })],
              width: { size: 17.5, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: `CHF ${item.total.toFixed(2)}`, alignment: AlignmentType.RIGHT })],
              width: { size: 17.5, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      );
      
      const doc = new Document({
        sections: [{
          children: [
            // Header - Company Name
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AutoRepair Pro',
                  bold: true,
                  size: 48,
                  color: 'B91C1C',
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // Company Address
            new Paragraph({ text: 'Musterstrasse 123', size: 18 }),
            new Paragraph({ text: '8000 Zürich', size: 18 }),
            new Paragraph({ text: 'Schweiz', size: 18 }),
            new Paragraph({ text: 'Tel: +41 44 123 45 67', size: 18 }),
            new Paragraph({ text: 'info@autorepairpro.ch', size: 18, spacing: { after: 400 } }),
            
            // Invoice Title and Details
            new Paragraph({
              children: [
                new TextRun({
                  text: 'RECHNUNG',
                  bold: true,
                  size: 40,
                  color: 'B91C1C',
                }),
              ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({ text: `Rechnungsnummer: ${invoiceNumber}`, size: 18 }),
            new Paragraph({ text: `Datum: ${invoiceDate}`, size: 18 }),
            new Paragraph({ text: `Fälligkeitsdatum: ${dueDate}`, size: 18 }),
            new Paragraph({ text: `Schadenmeldung: ${damageReport.id}`, size: 18, spacing: { after: 400 } }),
            
            // Customer Details
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Rechnungsempfänger:',
                  bold: true,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({ text: damageReport.customerName, size: 18 }),
            new Paragraph({ text: damageReport.vehicle || '', size: 18 }),
            new Paragraph({ text: `Versicherung: ${damageReport.insuranceCompany || ''}`, size: 18, spacing: { after: 400 } }),
            
            // Items Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Header Row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Beschreibung', bold: true })],
                      shading: { fill: 'B91C1C' },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Menge', bold: true, alignment: AlignmentType.RIGHT })],
                      shading: { fill: 'B91C1C' },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Einzelpreis', bold: true, alignment: AlignmentType.RIGHT })],
                      shading: { fill: 'B91C1C' },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Gesamt', bold: true, alignment: AlignmentType.RIGHT })],
                      shading: { fill: 'B91C1C' },
                    }),
                  ],
                }),
                // Item Rows
                ...itemRows,
              ],
            }),
            
            // Spacing after table
            new Paragraph({ text: '', spacing: { after: 300 } }),
            
            // Summary
            new Paragraph({
              text: `Zwischensumme: CHF ${subtotal.toFixed(2)}`,
              alignment: AlignmentType.RIGHT,
              size: 18,
            }),
            new Paragraph({
              text: `MwSt (${taxRate}%): CHF ${taxAmount.toFixed(2)}`,
              alignment: AlignmentType.RIGHT,
              size: 18,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Gesamtbetrag: CHF ${total.toFixed(2)}`,
                  bold: true,
                  size: 24,
                  color: 'B91C1C',
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 },
            }),
            
            // Notes
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Anmerkungen:',
                  bold: true,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({ text: notes, size: 18, spacing: { after: 400 } }),
            
            // Footer
            new Paragraph({
              text: 'AutoRepair Pro GmbH | UID: CHE-123.456.789 | Bank: Zürcher Kantonalbank',
              alignment: AlignmentType.CENTER,
              size: 14,
            }),
            new Paragraph({
              text: 'IBAN: CH93 0076 2011 6238 5295 7 | BIC: ZKBKCHZZ80A',
              alignment: AlignmentType.CENTER,
              size: 14,
            }),
          ],
        }],
      });
      
      // Generate and download the document
      import('docx').then((docx) => {
        docx.Packer.toBlob(doc).then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Rechnung_${invoiceNumber}_${damageReport.id}.docx`;
          link.click();
          window.URL.revokeObjectURL(url);
        });
      });
    });
  };

  const handleSendEmail = () => {
    // In einer echten Anwendung würde hier die E-Mail-Funktion implementiert
    const emailSubject = `Rechnung ${invoiceNumber} - ${damageReport.id}`;
    const emailBody = `Sehr geehrte/r ${damageReport.customerName},

anbei erhalten Sie die Rechnung für die Karosseriereparatur.

Rechnungsnummer: ${invoiceNumber}
Schadenmeldung: ${damageReport.id}
Gesamtbetrag: CHF ${total.toFixed(2)}

Mit freundlichen Grüssen
AutoRepair Pro Team`;

    console.log('E-Mail würde gesendet an:', damageReport.customerName);
    console.log('Betreff:', emailSubject);
    console.log('Nachricht:', emailBody);
    
    setStep('sent');
  };

  if (step === 'sent') {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl mb-4">Rechnung erfolgreich erstellt!</h2>
          <p className="text-muted-foreground mb-4">
            Die Rechnung <strong>{invoiceNumber}</strong> für Schadenmeldung <strong>{damageReport.id}</strong> wurde erstellt.
          </p>
          <p className="text-muted-foreground mb-8">
            Gesamtbetrag: <strong className="text-primary">CHF {total.toFixed(2)}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <Button variant="outline" onClick={() => setStep('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              Rechnung ansehen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rechnungsvorschau</CardTitle>
                <CardDescription>Überprüfen Sie die Rechnung vor dem Download/Versand</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setStep('edit')}>
                Bearbeiten
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Rechnung Vorschau */}
            <div className="bg-white text-black p-8 rounded-lg border-2 border-border max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-red-600 mb-2">AutoRepair Pro</h1>
                  <p className="text-sm text-gray-600">
                    Musterstrasse 123<br />
                    8000 Zürich<br />
                    Schweiz<br />
                    Tel: +41 44 123 45 67<br />
                    info@autorepairpro.ch
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold mb-2">RECHNUNG</h2>
                  <p className="text-sm text-gray-600">
                    Rechnungsnr: <strong>{invoiceNumber}</strong><br />
                    Datum: {invoiceDate}<br />
                    Fällig: {dueDate}<br />
                    Schadenmeldung: <strong>{damageReport.id}</strong>
                  </p>
                </div>
              </div>

              {/* Kundenadresse */}
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Rechnungsempfänger:</h3>
                <p className="text-sm">
                  {damageReport.customerName}<br />
                  {damageReport.vehicle}<br />
                  {damageReport.insuranceCompany && `Versicherung: ${damageReport.insuranceCompany}`}
                </p>
              </div>

              {/* Rechnungspositionen */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Beschreibung</th>
                    <th className="text-right py-2">Menge</th>
                    <th className="text-right py-2">Einzelpreis</th>
                    <th className="text-right py-2">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">CHF {item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-3">CHF {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summen */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Zwischensumme:</span>
                    <span>CHF {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>MwSt ({taxRate}%):</span>
                    <span>CHF {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
                    <span>Gesamtbetrag:</span>
                    <span className="text-red-600">CHF {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notizen */}
              {notes && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Anmerkungen:</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
                <p>
                  AutoRepair Pro GmbH | UID: CHE-123.456.789 | Bank: Zürcher Kantonalbank<br />
                  IBAN: CH93 0076 2011 6238 5295 7 | BIC: ZKBKCHZZ80A
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={generatePDF}>
                <Download className="h-4 w-4 mr-2" />
                Als PDF herunterladen
              </Button>
              <Button variant="outline" onClick={generateDOCX}>
                <Download className="h-4 w-4 mr-2" />
                Als DOCX herunterladen
              </Button>
              <Button onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail versenden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rechnung für Schadenreparatur erstellen</CardTitle>
              <CardDescription>
                Schadenmeldung: {damageReport.id} - {damageReport.customerName}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schadenmeldungs-Informationen */}
            <div className="lg:col-span-1">
              <div className="p-4 bg-card border border-border rounded-lg sticky top-4">
                <h3 className="font-medium mb-4">Schadenmeldung</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID</p>
                    <p className="font-medium">{damageReport.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kunde</p>
                    <p>{damageReport.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fahrzeug</p>
                    <p>{damageReport.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Versicherung</p>
                    <p>{damageReport.insuranceCompany}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Schadenart</p>
                    <p>{damageReport.damageType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Geschätzte Kosten</p>
                    <p className="text-primary font-medium">{damageReport.estimatedCost}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechnungsformular */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rechnungsdetails */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rechnungsdetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rechnungspositionen */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Positionen</CardTitle>
                    <Button size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Position hinzufügen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="p-4 bg-card border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <Badge variant="outline">Position {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor={`desc-${item.id}`}>Beschreibung</Label>
                            <Input
                              id={`desc-${item.id}`}
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Leistungsbeschreibung"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`qty-${item.id}`}>Menge</Label>
                            <Input
                              id={`qty-${item.id}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`}>Preis (CHF)</Label>
                            <Input
                              id={`price-${item.id}`}
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-right">
                          <span className="text-sm text-muted-foreground">Gesamt: </span>
                          <span className="text-lg font-medium text-primary">CHF {item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summen und Optionen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">MwSt-Satz (%)</Label>
                    <Select
                      value={String(taxRate)}
                      onValueChange={(value) => setTaxRate(parseFloat(value))}
                    >
                      <SelectTrigger id="taxRate">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (befreit)</SelectItem>
                        <SelectItem value="2.5">2.5% (reduziert)</SelectItem>
                        <SelectItem value="7.7">7.7% (normal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Anmerkungen</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Zahlungsbedingungen, Danksagung, etc."
                    />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Zwischensumme:</span>
                      <span>CHF {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>MwSt ({taxRate}%):</span>
                      <span>CHF {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Gesamtbetrag:</span>
                      <span className="text-primary">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setStep('preview')}
                    disabled={items.length === 0 || items.some(item => !item.description || item.total === 0)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vorschau anzeigen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
