export type ComplianceReportSeverity = 'None' | 'Low' | 'Moderate' | 'Severe';

export interface ComplianceReport {
  risk: ComplianceReportSeverity;
  isOnSanctionsList: boolean;
}

export interface ComplianceReportResult {
  isCompliant: boolean;
}
