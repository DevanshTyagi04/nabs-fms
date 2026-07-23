import { DocumentStatusConfig } from './types';

export class DocumentNumberStrategy {
  static formatNumber(prefix: string, dateStr: string, sequence: number): string {
    const d = new Date(dateStr);
    const dateFormatted = d.toISOString().slice(0, 10).replace(/-/g, '');
    const seqStr = String(sequence).padStart(4, '0');
    return `${prefix}-${dateFormatted}-${seqStr}`;
  }

  static parsePrefix(documentNumber: string): string {
    return documentNumber.split('-')[0] || 'DOC';
  }
}

export class DocumentStatusRegistry {
  private static statusMap: Record<string, DocumentStatusConfig> = {
    DRAFT: { status: 'DRAFT', label: 'Draft', variant: 'neutral', isTerminal: false },
    ISSUED: { status: 'ISSUED', label: 'Issued', variant: 'primary', isTerminal: false },
    SENT: { status: 'SENT', label: 'Sent to Customer', variant: 'secondary', isTerminal: false },
    VIEWED: { status: 'VIEWED', label: 'Viewed', variant: 'warning', isTerminal: false },
    PAID: { status: 'PAID', label: 'Paid in Full', variant: 'success', isTerminal: true },
    OVERDUE: { status: 'OVERDUE', label: 'Overdue', variant: 'error', isTerminal: false },
    CANCELLED: { status: 'CANCELLED', label: 'Cancelled / Void', variant: 'neutral', isTerminal: true },
  };

  static getConfig(status: string): DocumentStatusConfig {
    return this.statusMap[status] || { status, label: status, variant: 'neutral', isTerminal: false };
  }
}

export class DocumentProvider {
  static getPdfUrl(documentNumber: string): string {
    return `/api/v1/documents/${documentNumber}.pdf`;
  }
}

export class DocumentEngine {
  static renderContext(status: string, documentNumber: string) {
    const statusConfig = DocumentStatusRegistry.getConfig(status);
    const pdfUrl = DocumentProvider.getPdfUrl(documentNumber);
    const prefix = DocumentNumberStrategy.parsePrefix(documentNumber);

    return {
      statusConfig,
      pdfUrl,
      prefix,
    };
  }
}
