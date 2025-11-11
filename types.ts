export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  provider: string;
  date: string;
  amount: number;
  tax: number;
  total: number;
  fileName: string;
  items: InvoiceItem[];
  category: string;
}

export interface Income {
  id: string;
  source: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export enum View {
  DASHBOARD = 'Dashboard',
  INVOICES = 'Invoices',
  INCOME = 'Income',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ParsedInvoice {
  provider: string;
  date: string;
  amount: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
  category: string;
}