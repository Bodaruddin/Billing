import { useEffect } from 'react';
import { FileDown, MessageCircle, Printer, X } from 'lucide-react';
import type { Invoice, ReceiptLayout, ReceiptPaperSize } from '../../store';
import './ReceiptDialog.css';

export interface ReceiptDialogProps {
  invoice: Invoice;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shop: { name: string; phone: string; address: string };
  paperSize: ReceiptPaperSize;
  layout: ReceiptLayout;
  onPaperSizeChange: (value: ReceiptPaperSize) => void;
  onLayoutChange: (value: ReceiptLayout) => void;
  onClose: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onWhatsApp: () => void;
}

const paperOptions: { value: ReceiptPaperSize; label: string; detail: string }[] = [
  { value: 'a4', label: 'A4', detail: '210 × 297 mm' },
  { value: 'a5', label: 'A5', detail: '148 × 210 mm' },
  { value: 'thermal80', label: 'Thermal 80', detail: '80 mm roll' },
  { value: 'thermal58', label: 'Thermal 58', detail: '58 mm roll' },
];

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function ReceiptDialog({
  invoice,
  customerName,
  customerPhone,
  customerAddress,
  shop,
  paperSize,
  layout,
  onPaperSizeChange,
  onLayoutChange,
  onClose,
  onPrint,
  onDownloadPdf,
  onWhatsApp,
}: ReceiptDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="receipt-dialog__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="receipt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-dialog-title"
        data-testid="dialog-receipt"
      >
        <header className="receipt-dialog__header">
          <div className="receipt-dialog__heading">
            <span className="receipt-dialog__eyebrow">SAVED INVOICE</span>
            <h2 id="receipt-dialog-title">Receipt preview</h2>
            <p>Choose a paper format, then send or print this bill.</p>
          </div>
          <button
            type="button"
            className="receipt-dialog__close"
            aria-label="Close receipt preview"
            data-testid="button-receipt-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>

        <div className="receipt-dialog__body">
          <aside className="receipt-dialog__controls" aria-label="Receipt options">
            <fieldset className="receipt-dialog__fieldset">
              <legend>Paper size</legend>
              <div className="receipt-dialog__paper-options">
                {paperOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`receipt-dialog__paper-option${paperSize === option.value ? ' is-selected' : ''}`}
                    aria-pressed={paperSize === option.value}
                    data-testid={`button-receipt-paper-${option.value}`}
                    onClick={() => onPaperSizeChange(option.value)}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="receipt-dialog__fieldset">
              <legend>Layout</legend>
              <div className="receipt-dialog__layout-options">
                {(['standard', 'compact'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`receipt-dialog__layout-option${layout === option ? ' is-selected' : ''}`}
                    aria-pressed={layout === option}
                    data-testid={`button-receipt-layout-${option}`}
                    onClick={() => onLayoutChange(option)}
                  >
                    <span>{option === 'standard' ? 'Standard' : 'Compact'}</span>
                    <small>{option === 'standard' ? 'Room to read' : 'Less paper'}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="receipt-dialog__action-list">
              <button type="button" className="receipt-dialog__action receipt-dialog__action--primary" data-testid="button-receipt-print" onClick={onPrint}>
                <Printer size={17} />
                <span>Print receipt</span>
              </button>
              <button type="button" className="receipt-dialog__action" data-testid="button-receipt-download-pdf" onClick={onDownloadPdf}>
                <FileDown size={17} />
                <span>Download PDF</span>
              </button>
              <button type="button" className="receipt-dialog__action" data-testid="button-receipt-whatsapp" onClick={onWhatsApp}>
                <MessageCircle size={17} />
                <span>Share on WhatsApp</span>
              </button>
            </div>
            <p className="receipt-dialog__offline-note">Invoice saved on this device.</p>
          </aside>

          <div className="receipt-dialog__preview-area" data-testid="receipt-preview-area">
            <div
              className={`receipt-paper print-area receipt-paper--${paperSize} receipt-paper--${layout}`}
              data-testid="receipt-preview"
              aria-label={`${paperSize} ${layout} receipt preview`}
            >
              <div className="receipt-paper__topline">
                <span>AR BILLING</span>
                <span>RETAIL INVOICE</span>
              </div>
              <div className="receipt-paper__shop">
                <div className="receipt-paper__mark" aria-hidden="true">AR</div>
                <h3>{shop.name || 'Shop name'}</h3>
                {shop.address && <p>{shop.address}</p>}
                {shop.phone && <p>Phone: {shop.phone}</p>}
              </div>

              <div className="receipt-paper__invoice-meta">
                <div>
                  <span>INVOICE NO.</span>
                  <strong>{invoice.number}</strong>
                </div>
                <div>
                  <span>DATE</span>
                  <strong>{formatDate(invoice.date)}</strong>
                </div>
              </div>

              <div className="receipt-paper__customer">
                <span className="receipt-paper__label">BILLED TO</span>
                <strong>{customerName || 'Walk-in customer'}</strong>
                {customerPhone && <span>{customerPhone}</span>}
                {customerAddress && <span>{customerAddress}</span>}
              </div>

              <table className="receipt-paper__items">
                <thead>
                  <tr>
                    <th className="receipt-paper__item-name">Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th className="receipt-paper__amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const lineTotal = item.quantity * item.unitPrice - item.discount;
                    return (
                      <tr key={`${item.productId}-${index}`} data-testid={`receipt-item-${index}`}>
                        <td className="receipt-paper__item-name">
                          <strong>{item.name}</strong>
                          {item.imei && <small>IMEI: {item.imei}</small>}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{money(item.unitPrice)}</td>
                        <td className="receipt-paper__amount">{money(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="receipt-paper__totals">
                {invoice.discount > 0 && (
                  <div><span>Bill discount</span><span>− {money(invoice.discount)}</span></div>
                )}
                <div className="receipt-paper__grand-total">
                  <strong>Total</strong><strong>{money(invoice.total)}</strong>
                </div>
                <div><span>Paid · {invoice.paymentMethod}</span><span>{money(invoice.paymentAmount)}</span></div>
                {invoice.paymentReference && <div><span>Payment reference</span><span>{invoice.paymentReference}</span></div>}
                <div className="receipt-paper__due"><strong>Balance due</strong><strong>{money(invoice.due)}</strong></div>
              </div>

              <div className="receipt-paper__footer">
                <strong>Thank you for your purchase.</strong>
                <span>Keep this invoice for service and warranty support.</span>
                <small>Computer-generated retail invoice · Not a tax invoice</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ReceiptDialog;
