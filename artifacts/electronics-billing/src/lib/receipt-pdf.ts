import { jsPDF } from 'jspdf';
import type { Invoice, ReceiptLayout, ReceiptPaperSize } from '../store';

export type ReceiptPdfOptions = {
  invoice: Invoice;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shop: { name: string; phone: string; address: string };
  paperSize: ReceiptPaperSize;
  layout: ReceiptLayout;
};

function pdfText(value: string) {
  return value
    .replaceAll('₹', 'INR ')
    .replaceAll('·', '-')
    .replaceAll('×', 'x')
    .replace(/[–—]/g, '-');
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function createReceiptPdf({ invoice, customerName, customerPhone, customerAddress, shop, paperSize, layout }: ReceiptPdfOptions) {
  const isThermal = paperSize === 'thermal80' || paperSize === 'thermal58';
  const width = paperSize === 'thermal58' ? 58 : paperSize === 'thermal80' ? 80 : undefined;
  const compact = layout === 'compact';
  const estimatedHeight = isThermal
    ? Math.max(150, 95 + invoice.items.reduce((sum, item) => sum + Math.max(1, Math.ceil(item.name.length / (paperSize === 'thermal58' ? 22 : 34))) * 13, 0))
    : undefined;
  const format = paperSize === 'a5'
    ? 'a5'
    : paperSize === 'a4'
      ? 'a4'
      : [width!, estimatedHeight!];
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format, compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = isThermal ? 4 : compact ? 10 : 14;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = compact ? 4.5 : 5.5;
  let y = margin;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const write = (value: string, size = 9, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    const text = pdfText(value);
    const maxWidth = contentWidth;
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const height = lines.length * lineHeight;
    ensureSpace(height + 1);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(31, 41, 55);
    for (const line of lines) {
      const x = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
      doc.text(line, x, y, { align });
      y += lineHeight;
    }
    return height;
  };
  const divider = () => {
    ensureSpace(5);
    y += compact ? 1 : 2;
    doc.setDrawColor(177, 190, 211);
    doc.line(margin, y, pageWidth - margin, y);
    y += compact ? 4 : 6;
  };

  doc.setTextColor(23, 45, 87);
  write(shop.name || 'AR BILLING', isThermal ? 14 : 18, true, 'center');
  if (shop.address) write(shop.address, isThermal ? 7 : 9, false, 'center');
  if (shop.phone) write(shop.phone, isThermal ? 7 : 9, false, 'center');
  divider();
  write('RETAIL BILL', isThermal ? 11 : 13, true, 'center');
  write(`Invoice: ${invoice.number}`, isThermal ? 8 : 10, true);
  write(`Date: ${formatDate(invoice.date)}`, isThermal ? 8 : 10);
  write(`Customer: ${customerName || 'Walk-in customer'}`, isThermal ? 8 : 10);
  if (customerPhone) write(`Phone: ${customerPhone}`, isThermal ? 8 : 10);
  if (customerAddress) write(`Address: ${customerAddress}`, isThermal ? 8 : 10);
  divider();

  for (const item of invoice.items) {
    const itemAmount = item.unitPrice * item.quantity - item.discount;
    const nameLines = doc.splitTextToSize(pdfText(item.name), contentWidth) as string[];
    ensureSpace(nameLines.length * lineHeight + lineHeight * 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isThermal ? 8 : 10);
    doc.setTextColor(31, 41, 55);
    for (const line of nameLines) {
      doc.text(line, margin, y);
      y += lineHeight;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isThermal ? 7 : 9);
    const detail = `${item.quantity} x INR ${item.unitPrice.toLocaleString('en-IN')}${item.discount ? ` · discount INR ${item.discount.toLocaleString('en-IN')}` : ''}`;
    doc.text(pdfText(detail), margin, y);
    doc.text(`INR ${itemAmount.toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
    y += lineHeight + (compact ? 1 : 3);
  }

  divider();
  if (invoice.discount > 0) write(`Bill discount: INR ${invoice.discount.toLocaleString('en-IN')}`, isThermal ? 8 : 10);
  write(`Total: INR ${invoice.total.toLocaleString('en-IN')}`, isThermal ? 11 : 13, true);
  write(`Paid: INR ${invoice.paymentAmount.toLocaleString('en-IN')}`, isThermal ? 8 : 10);
  if (invoice.due > 0) write(`Balance due: INR ${invoice.due.toLocaleString('en-IN')}`, isThermal ? 9 : 11, true);
  write(`Payment: ${invoice.paymentMethod}`, isThermal ? 8 : 10);
  if (invoice.paymentReference) write(`Reference: ${invoice.paymentReference}`, isThermal ? 7 : 9);
  divider();
  write('Retail invoice - not a tax invoice.', isThermal ? 7 : 9, false, 'center');
  write('Thank you for shopping with us.', isThermal ? 7 : 9, false, 'center');
  return doc;
}

export function downloadReceiptPdf(options: ReceiptPdfOptions) {
  const doc = createReceiptPdf(options);
  doc.save(`${options.invoice.number || 'AR-BILLING-RECEIPT'}.pdf`);
  return doc;
}
