export type UserRole = 'data_entry' | 'approver' | 'auditor';

export interface MockUserAccount {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  description: string;
}

export const MOCK_USERS: MockUserAccount[] = [
  {
    id: 'user-an',
    name: 'Nguyễn Văn An',
    role: 'data_entry',
    roleLabel: 'Người nhập dữ liệu',
    title: 'Cán bộ Môi trường EHS',
    description: 'Nhập số liệu điện, dầu DO, đính kèm hóa đơn chứng từ và ghi chú đối soát.',
  },
  {
    id: 'user-duc',
    name: 'Trần Minh Đức',
    role: 'approver',
    roleLabel: 'Người duyệt',
    title: 'Trưởng ban Môi trường',
    description: 'Xác nhận thông số kỹ thuật dầu DO và phê duyệt kỳ kiểm kê phát thải.',
  },
  {
    id: 'user-hai',
    name: 'Phan Thanh Hải',
    role: 'auditor',
    roleLabel: 'Người kiểm tra, chỉ đọc',
    title: 'Kiểm tra độc lập',
    description: 'Xem số liệu hoạt động, kiểm tra công thức, tra cứu hóa đơn và xuất báo cáo.',
  },
];

export interface ActivityRecord {
  id: string;
  year: number;
  month: number;
  category: 'electricity' | 'diesel';
  categoryLabel?: string;
  categoryName?: string;
  value: number;
  unit: string;
  invoiceNumber: string;
  enteredBy: string;
  enteredRole: string;
  timestamp: string;
  hasAttachment: boolean;
  attachmentName?: string;
  attachmentMeta?: {
    issuer: string;
    issueDate: string;
    meterCode?: string;
    totalAmountVND?: number;
    taxCode: string;
    hashValidation: string;
  };
  notes?: string;
  isFlaggedAnomaly?: boolean;
}

export interface EmissionFactor {
  id: string;
  category: 'electricity' | 'diesel';
  categoryName: string;
  dataYear: number; // Năm dữ liệu
  documentNumber: string; // Số công văn/văn bản
  documentDate: string; // Ngày ban hành tài liệu (YYYY-MM-DD)
  internalVersion: string; // Phiên bản bản ghi nội bộ CarbonLens
  value: number; // For electricity: tCO2/MWh
  unit: string; // tCO2/MWh
  gasType: 'CO2';
  status: 'official' | 'estimated';
  statusLabel: string;
  legalSource: string;
  documentReference: string;
  formulaDescription: string;
  isEditable?: boolean;
  configNotes?: string;
}

// Cấu hình chi tiết dầu DO theo chuẩn IPCC 2006 (Tier 1 vs Tier 2/3)
export interface DieselParameters {
  density: number; // rho: kg/lít (tham khảo 0.84 kg/lít)
  densityStatus: 'default_tier1' | 'certified_tier2';
  densityDoc?: string;
  ncv: number; // NCV: TJ/Gg = GJ/tấn (IPCC 2006 mặc định 43.0 TJ/Gg)
  ncvStatus: 'default_tier1' | 'certified_tier2';
  ncvDoc?: string;
  efCO2: number; // kg CO2/TJ (IPCC 2006 mặc định 74,100 kg CO2/TJ)
  efCH4: number; // kg CH4/TJ (IPCC 2006 mặc định 3.0 kg CH4/TJ)
  efN2O: number; // kg N2O/TJ (IPCC 2006 mặc định 0.6 kg N2O/TJ)
  gwpCH4: number; // AR5: 28
  gwpN2O: number; // AR5: 265
  isConfirmedByAdvisor: boolean; // Quy tắc phê duyệt nội bộ của nguyên mẫu
  advisorName?: string;
  confirmationDate?: string;
  confirmationNotes?: string;
}

export type EvidenceLevel = 0 | 1 | 2 | 3;

export interface CreditBatch {
  id: string;
  program: string; // e.g., "Verra VCS", "Gold Standard"
  projectId: string; // e.g., "VCS-1844 [Dữ liệu mô phỏng]"
  projectName: string;
  country: string;
  serialNumber: string;
  vintageYear: number;
  quantity: number; // tCO2e
  evidenceLevel: EvidenceLevel;
  evidenceTitle: string;
  evidenceDescription: string;
  isSimulationData: true;
  documents: {
    name: string;
    type: 'pdd' | 'issuance' | 'retirement' | 'monitoring';
    url: string;
    verifiedDate?: string;
  }[];
  retirementDetails?: {
    registryName: string;
    serialRange: string;
    quantityRetired: number;
    retiredDate: string;
    beneficiary: string;
    purpose: string;
    registryPublicUrl: string;
    certificateId: string;
  };
}

export interface ValidationIssue {
  id: string;
  severity: 'critical' | 'warning';
  type: 'missing_month' | 'missing_voucher_file' | 'duplicate_voucher' | 'unit_mismatch' | 'high_fluctuation' | 'unconfirmed_diesel';
  title: string;
  description: string;
  recordId?: string;
  month?: number;
  category?: 'electricity' | 'diesel';
  suggestedAction: string;
  canQuickFix?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface FacilityProfile {
  companyName: string;
  facilityName: string;
  address: string;
  businessSector: string;
  reportingYear: number;
  inventoryStatus: 'draft' | 'under_review' | 'approved';
  approvalDate?: string;
  approvedBy?: string;
}
