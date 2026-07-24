import { DashboardMetric, WidgetConfig } from './types';

export class WidgetRegistry {
  private static widgetMap: Record<string, WidgetConfig> = {
    TOTAL_REVENUE: { widgetId: 'TOTAL_REVENUE', type: 'KPI', title: 'Total Gross Revenue', drillDownRoute: '/invoices' },
    ACTIVE_WORK_ORDERS: { widgetId: 'ACTIVE_WORK_ORDERS', type: 'KPI', title: 'Active Work Orders', drillDownRoute: '/work-orders' },
    COMPLETED_SERVICES: { widgetId: 'COMPLETED_SERVICES', type: 'KPI', title: 'Completed Service Tickets', drillDownRoute: '/service-requests' },
    PAYMENT_SETTLEMENT_RATE: { widgetId: 'PAYMENT_SETTLEMENT_RATE', type: 'KPI', title: 'Payment Settlement Rate', drillDownRoute: '/payments' },
  };

  static getWidget(widgetId: string): WidgetConfig {
    return (
      this.widgetMap[widgetId] || {
        widgetId,
        type: 'KPI',
        title: widgetId,
        drillDownRoute: '/',
      }
    );
  }
}

export class KpiEngine {
  static formatKpi(metric: DashboardMetric) {
    const formattedVal =
      typeof metric.value === 'number' && metric.category === 'REVENUE'
        ? `$${metric.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : metric.value.toString();

    const trendText = metric.trendPercent !== undefined ? `${metric.trendPercent > 0 ? '+' : ''}${metric.trendPercent}% vs prev period` : '';

    return {
      formattedVal,
      trendText,
    };
  }
}

export class ExportEngine {
  static exportReport(reportType: string, format: 'CSV' | 'PDF') {
    const filename = `${reportType.toLowerCase()}_report_${Date.now()}.${format.toLowerCase()}`;
    return {
      filename,
      status: 'EXPORTED',
    };
  }
}

export class DashboardNavigator {
  static resolveRoute(widgetId: string): string {
    const widget = WidgetRegistry.getWidget(widgetId);
    return widget.drillDownRoute;
  }
}

export class ReportsEngine {
  static evaluateMetric(metric: DashboardMetric) {
    const widget = WidgetRegistry.getWidget(metric.id);
    const { formattedVal, trendText } = KpiEngine.formatKpi(metric);

    return {
      widget,
      formattedVal,
      trendText,
    };
  }
}
