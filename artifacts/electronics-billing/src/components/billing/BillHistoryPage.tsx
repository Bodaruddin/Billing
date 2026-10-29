import { useMemo, useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import type { Customer, Invoice } from '../../store';

type BillHistoryPageProps = {
  invoices: Invoice[];
  customers: Customer[];
  onOpenReceipt: (invoice: Invoice) => void;
  onCreateBill: () => void;
};

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function BillHistoryPage({ invoices, customers, onOpenReceipt, onCreateBill }: BillHistoryPageProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) => {
      const customer = customers.find((item) => item.id === invoice.customerId);
      return [
        invoice.number,
        invoice.date,
        invoice.paymentMethod,
        invoice.paymentReference,
        invoice.customerName,
        invoice.customerPhone,
        customer?.name,
        customer?.phone,
        ...invoice.items.map((item) => item.name),
      ].some((value) => value?.toLowerCase().includes(normalized));
    });
  }, [customers, invoices, query]);

  return (
    <div className="fade-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">SAVED BILLS</span>
          <h2 className="display mt-2 text-2xl font-extrabold">Bill history</h2>
          <p className="mt-1 text-xs text-muted-foreground">Search invoices and reopen their receipt actions.</p>
        </div>
        <button type="button" className="button-primary whitespace-nowrap" data-testid="button-create-bill-from-history" onClick={onCreateBill}>
          <Plus size={16} /> New bill
        </button>
      </div>

      <div className="search-box mb-4 w-full sm:max-w-sm">
        <Search size={17} />
        <input
          type="search"
          data-testid="input-search-bills"
          aria-label="Search bills"
          placeholder="Search bill, customer, item, or reference"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <section className="panel billing-history" aria-label="Saved invoices">
        {filtered.map((invoice) => {
          const customer = customers.find((item) => item.id === invoice.customerId);
          const customerName = invoice.customerName || customer?.name || 'Walk-in customer';
          return (
            <div className="billing-history-row" key={invoice.id} data-testid={`row-bill-${invoice.id}`}>
              <div>
                <strong>{invoice.number}</strong>
                <small>{customerName}{invoice.customerPhone || customer?.phone ? ` · ${invoice.customerPhone || customer?.phone}` : ''}</small>
              </div>
              <div className="history-date">
                <strong>{formatDate(invoice.date)}</strong>
                <small>{invoice.items.length} line items</small>
              </div>
              <div className="history-method">
                <strong>{invoice.paymentMethod}</strong>
                <small>{invoice.paymentReference || 'No payment reference'}</small>
              </div>
              <div>
                <strong>{money(invoice.total)}</strong>
                <small>{invoice.due > 0 ? `${money(invoice.due)} due` : 'Paid'}</small>
              </div>
              <button
                type="button"
                className="button-secondary"
                data-testid={`button-open-receipt-${invoice.id}`}
                onClick={() => onOpenReceipt(invoice)}
              >
                <FileText size={15} /> Receipt
              </button>
            </div>
          );
        })}
        {!filtered.length && (
          <div className="billing-history-empty">
            {invoices.length ? 'No bills match that search.' : 'No bills saved yet. Create a bill to see it here.'}
          </div>
        )}
      </section>
    </div>
  );
}
