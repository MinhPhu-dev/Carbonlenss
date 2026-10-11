import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  MockUserAccount,
  ActivityRecord,
  EmissionFactor,
  DieselParameters,
  CreditBatch,
  FacilityProfile,
  AuditLogEntry,
  ValidationIssue,
} from '../types';
import {
  INITIAL_FACILITY,
  INITIAL_EMISSION_FACTORS,
  INITIAL_DIESEL_PARAMETERS,
  INITIAL_ACTIVITY_RECORDS,
  MISSING_JULY_ELECTRICITY_RECORD,
  INITIAL_CREDIT_BATCHES,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface CarbonContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: MockUserAccount | null;
  login: (user: MockUserAccount) => void;
  logout: () => void;
  facility: FacilityProfile;
  setFacility: React.Dispatch<React.SetStateAction<FacilityProfile>>;
  activeYear: number;
  setActiveYear: (year: number) => void;
  activeScreen: 'activity' | 'results' | 'quality' | 'credits' | 'report';
  setActiveScreen: (screen: 'activity' | 'results' | 'quality' | 'credits' | 'report') => void;

  // Data
  activityRecords: ActivityRecord[];
  emissionFactors: EmissionFactor[];
  dieselParams: DieselParameters;
  creditBatches: CreditBatch[];
  auditLogs: AuditLogEntry[];
  validationIssues: ValidationIssue[];
  criticalIssuesCount: number;
  canApprove: boolean;

  // Calculations
  scope1CO2Ton: number;
  scope1CH4TonCO2e: number;
  scope1N2OTonCO2e: number;
  scope1TotalTCO2e: number;
  scope2TotalTCO2: number;
  grossEmissionsTCO2e: number;
  onSiteReductionTCO2e: number;
  level3CreditsTCO2e: number;
  unretiredCreditsTCO2e: number;

  // Modals & UI states
  selectedRecordForDoc: ActivityRecord | null;
  setSelectedRecordForDoc: (rec: ActivityRecord | null) => void;
  selectedFormulaForInspection: {
    category: 'electricity' | 'diesel';
    year: number;
    record?: ActivityRecord;
  } | null;
  setSelectedFormulaForInspection: (info: {
    category: 'electricity' | 'diesel';
    year: number;
    record?: ActivityRecord;
  } | null) => void;
  isAuditLogOpen: boolean;
  setIsAuditLogOpen: (open: boolean) => void;

  // Actions
  addRecord: (record: Omit<ActivityRecord, 'id' | 'timestamp'>, reason: string) => void;
  updateRecord: (id: string, updates: Partial<ActivityRecord>, reason: string) => void;
  deleteRecord: (id: string, reason: string) => void;
  quickFixAddJuly: () => void;
  updateEmissionFactor: (id: string, newValue: number, reason: string) => void;
  updateDieselParams: (params: Partial<DieselParameters>, reason: string) => void;
  confirmDieselParameters: (advisorName: string, notes: string) => void;
  updateCreditBatchLevel: (id: string, newLevel: 0 | 1 | 2 | 3, reason: string) => void;
  approveInventory: () => { success: boolean; message: string };
  resetDemoData: () => void;
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RECORDS: 'carbonlens_records_v3',
  FACTORS: 'carbonlens_factors_v3',
  DIESEL_PARAMS: 'carbonlens_diesel_params_v3',
  CREDITS: 'carbonlens_credits_v3',
  LOGS: 'carbonlens_logs_v3',
  FACILITY: 'carbonlens_facility_v3',
  ROLE: 'carbonlens_role_v3',
};

const SESSION_KEY = 'carbonlens_session_user';

export const CarbonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUserAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as MockUserAccount) : null;
    } catch {
      return null;
    }
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const u = JSON.parse(saved) as MockUserAccount;
        return u.role;
      }
    } catch {
      // ignore
    }
    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (savedRole as UserRole) || 'data_entry';
  });

  const login = (user: MockUserAccount) => {
    setCurrentUser(user);
    setRoleState(user.role);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setActiveScreen('activity');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
    setActiveScreen('activity');
  };

  const [activeYear, setActiveYear] = useState<number>(2023);
  const [activeScreen, setActiveScreen] = useState<'activity' | 'results' | 'quality' | 'credits' | 'report'>('activity');

  const [facility, setFacility] = useState<FacilityProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FACILITY);
    return saved ? JSON.parse(saved) : INITIAL_FACILITY;
  });

  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_RECORDS;
  });

  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FACTORS);
    return saved ? JSON.parse(saved) : INITIAL_EMISSION_FACTORS;
  });

  const [dieselParams, setDieselParams] = useState<DieselParameters>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIESEL_PARAMS);
    return saved ? JSON.parse(saved) : INITIAL_DIESEL_PARAMETERS;
  });

  const [creditBatches, setCreditBatches] = useState<CreditBatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDITS);
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_BATCHES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // UI state
  const [selectedRecordForDoc, setSelectedRecordForDoc] = useState<ActivityRecord | null>(null);
  const [selectedFormulaForInspection, setSelectedFormulaForInspection] = useState<{
    category: 'electricity' | 'diesel';
    year: number;
    record?: ActivityRecord;
  } | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACILITY, JSON.stringify(facility));
  }, [facility]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(activityRecords));
  }, [activityRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACTORS, JSON.stringify(emissionFactors));
  }, [emissionFactors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIESEL_PARAMS, JSON.stringify(dieselParams));
  }, [dieselParams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(creditBatches));
  }, [creditBatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const getRoleName = (r: UserRole): string => {
    switch (r) {
      case 'data_entry':
        return 'Nguyễn Văn An (Người nhập)';
      case 'approver':
        return 'Trần Minh Đức (Người duyệt)';
      case 'auditor':
        return 'Phan Thanh Hải (Người kiểm tra)';
    }
  };

  const addAuditLog = (action: string, target: string, oldValue: string, newValue: string, reason: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userName: getRoleName(role),
      userRole: role === 'data_entry' ? 'Cán bộ Nhập liệu' : role === 'approver' ? 'Người duyệt' : 'Người kiểm tra (Chỉ đọc)',
      action,
      target,
      oldValue,
      newValue,
      reason,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Automated Quality Engine: Rà soát nghiêm ngặt từng tiêu chí
  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];
    const yearRecords = activityRecords.filter((r) => r.year === activeYear);

    // 1. Kiểm tra thiếu tháng (Tình huống A: Không có bản ghi tháng)
    const elecRecords = yearRecords.filter((r) => r.category === 'electricity');
    const existingElecMonths = new Set(elecRecords.map((r) => r.month));
    for (let m = 1; m <= 12; m++) {
      if (!existingElecMonths.has(m)) {
        issues.push({
          id: `issue-missing-elec-${m}`,
          severity: 'critical',
          type: 'missing_month',
          title: `Thiếu bản ghi dữ liệu điện lưới Tháng ${m.toString().padStart(2, '0')}/${activeYear}`,
          description: `Kỳ kiểm kê cả năm yêu cầu đủ 12 tháng dữ liệu. Hiện chưa có bất kỳ bản ghi nào cho Tháng ${m} (Tình huống A: Chưa có số liệu).`,
          month: m,
          category: 'electricity',
          suggestedAction: m === 7 ? 'Bổ sung bản ghi và hóa đơn EVN Tháng 07/2023 (Có nút nạp mẫu 1 chạm)' : `Nhập hóa đơn EVN Tháng ${m}`,
          canQuickFix: m === 7,
        });
      }
    }

    // 2. Kiểm tra có bản ghi nhưng thiếu tệp hóa đơn đính kèm (Tình huống B)
    yearRecords.forEach((r) => {
      if (!r.hasAttachment || !r.attachmentName || r.attachmentName.trim() === '') {
        issues.push({
          id: `issue-novoucher-${r.id}`,
          severity: 'critical', // Thiếu hóa đơn gốc là lỗi chặn phê duyệt
          type: 'missing_voucher_file',
          title: `Thiếu tệp chứng từ gốc: ${r.categoryLabel || r.categoryName} Tháng ${r.month}/${r.year}`,
          description: `Đã có bản ghi số liệu và số hóa đơn "${r.invoiceNumber}", nhưng CHƯA ĐÍNH KÈM tệp hóa đơn điện tử PDF (Tình huống B: Thiếu file chứng từ).`,
          recordId: r.id,
          month: r.month,
          suggestedAction: 'Tải lên bản sao hóa đơn điện tử có chữ ký số để đối soát tính toàn vẹn.',
        });
      }
    });

    // 3. Kiểm tra thông số dầu DO: Nếu chưa xác nhận -> CHẶN DUYỆT BÁO CÁO
    if (!dieselParams.isConfirmedByAdvisor) {
      issues.push({
        id: 'issue-unconfirmed-diesel',
        severity: 'critical',
        type: 'unconfirmed_diesel',
        title: 'Thông số hóa lý dầu DO chưa xác nhận — không dùng cho báo cáo đã duyệt',
        description: `Thông số khối lượng riêng (ρ = ${dieselParams.density} kg/lít) và nhiệt trị (NCV = ${dieselParams.ncv} TJ/Gg) chưa được đơn vị kiểm định độc lập cấp chứng thư. Hệ thống chặn phê duyệt báo cáo hoàn chỉnh.`,
        suggestedAction: 'Người duyệt hoặc cố vấn kỹ thuật cần xác nhận thông số dầu DO kèm căn cứ kiểm nghiệm.',
      });
    }

    // 4. Kiểm tra trùng lặp số chứng từ
    const invoiceCount = new Map<string, ActivityRecord[]>();
    yearRecords.forEach((r) => {
      const trimmed = r.invoiceNumber.trim();
      if (trimmed) {
        const arr = invoiceCount.get(trimmed) || [];
        arr.push(r);
        invoiceCount.set(trimmed, arr);
      }
    });
    invoiceCount.forEach((records, invoiceNo) => {
      if (records.length > 1) {
        issues.push({
          id: `issue-dup-${invoiceNo}`,
          severity: 'critical',
          type: 'duplicate_voucher',
          title: `Trùng lặp số chứng từ: ${invoiceNo}`,
          description: `Số hóa đơn này đang được gán cho ${records.length} dòng dữ liệu khác nhau (Tháng ${records.map((r) => r.month).join(', ')}). Rủi ro trùng lặp số liệu.`,
          suggestedAction: 'Kiểm tra lại bản quét hóa đơn gốc và hiệu chỉnh số chứng từ duy nhất.',
        });
      }
    });

    // 5. Kiểm tra sai đơn vị
    yearRecords.forEach((r) => {
      if (r.category === 'electricity' && r.unit.toLowerCase() !== 'kwh') {
        issues.push({
          id: `issue-unit-${r.id}`,
          severity: 'critical',
          type: 'unit_mismatch',
          title: `Sai đơn vị đo lường: Dòng điện T${r.month} dùng đơn vị "${r.unit}"`,
          description: `Công thức quy chuẩn yêu cầu điện nhập bằng "kWh". Nếu nhập MWh sẽ làm sai lệch kết quả 1.000 lần.`,
          recordId: r.id,
          month: r.month,
          category: 'electricity',
          suggestedAction: 'Chuyển đổi dữ liệu về đơn vị kWh chuẩn hóa.',
        });
      }
    });

    // 6. Cảnh báo biến động >30% so với tháng trước
    const sortedElec = [...elecRecords].sort((a, b) => a.month - b.month);
    for (let i = 1; i < sortedElec.length; i++) {
      const prev = sortedElec[i - 1];
      const curr = sortedElec[i];
      if (curr.month === prev.month + 1 && prev.value > 0) {
        const diffRatio = Math.abs(curr.value - prev.value) / prev.value;
        if (diffRatio > 0.30) {
          const pct = Math.round(diffRatio * 100);
          issues.push({
            id: `issue-fluct-elec-${curr.id}`,
            severity: 'warning',
            type: 'high_fluctuation',
            title: `Biến động bất thường ${curr.value > prev.value ? '+' : '-'}${pct}% điện năng T${curr.month} so với T${prev.month}`,
            description: `Mức tiêu thụ thay đổi từ ${prev.value.toLocaleString('vi-VN')} kWh lên ${curr.value.toLocaleString('vi-VN')} kWh (>30%). Cần giải trình lý do sản xuất.`,
            recordId: curr.id,
            month: curr.month,
            category: 'electricity',
            suggestedAction: curr.notes ? 'Đã có ghi chú giải trình' : 'Thêm ghi chú giải trình lý do phụ tải tăng/giảm đột biến.',
          });
        }
      }
    }

    return issues;
  }, [activityRecords, activeYear, dieselParams]);

  const criticalIssuesCount = useMemo(() => {
    return validationIssues.filter((i) => i.severity === 'critical').length;
  }, [validationIssues]);

  // Điều kiện để duyệt: Không còn lỗi chặn VÀ người dùng có vai trò 'approver'
  const canApprove = criticalIssuesCount === 0 && role === 'approver';

  // 1. Tính toán phát thải điện lưới (Scope 2)
  // Công thức: E_điện = [Q (kWh) / 1000] × EF (tCO2/MWh)
  const electricityEF = useMemo(() => {
    const ef = emissionFactors.find((f) => f.category === 'electricity' && f.dataYear === activeYear);
    return ef ? ef.value : 0.6592;
  }, [emissionFactors, activeYear]);

  const scope2TotalTCO2 = useMemo(() => {
    const elecSumKWh = activityRecords
      .filter((r) => r.year === activeYear && r.category === 'electricity')
      .reduce((sum, r) => sum + r.value, 0);
    // (kWh / 1000) MWh * EF (tCO2/MWh) = tCO2
    return (elecSumKWh / 1000) * electricityEF;
  }, [activityRecords, activeYear, electricityEF]);

  // 2. Tính toán phát thải dầu DO (Scope 1) theo chuẩn IPCC 2006
  // E_CO2 = V_DO × ρ × NCV × EF_CO2 × 10^-9 (tCO2)
  const totalDOLiters = useMemo(() => {
    return activityRecords
      .filter((r) => r.year === activeYear && r.category === 'diesel')
      .reduce((sum, r) => sum + r.value, 0);
  }, [activityRecords, activeYear]);

  const scope1CO2Ton = useMemo(() => {
    // V_DO (lít) * rho (kg/lít) * NCV (TJ/Gg) * efCO2 (kg/TJ) * 1e-9 = tCO2
    return totalDOLiters * dieselParams.density * dieselParams.ncv * dieselParams.efCO2 * 1e-9;
  }, [totalDOLiters, dieselParams]);

  const scope1CH4TonCO2e = useMemo(() => {
    // tCH4 * GWP (28) = tCO2e
    const tCH4 = totalDOLiters * dieselParams.density * dieselParams.ncv * dieselParams.efCH4 * 1e-9;
    return tCH4 * dieselParams.gwpCH4;
  }, [totalDOLiters, dieselParams]);

  const scope1N2OTonCO2e = useMemo(() => {
    // tN2O * GWP (265) = tCO2e
    const tN2O = totalDOLiters * dieselParams.density * dieselParams.ncv * dieselParams.efN2O * 1e-9;
    return tN2O * dieselParams.gwpN2O;
  }, [totalDOLiters, dieselParams]);

  const scope1TotalTCO2e = useMemo(() => {
    return scope1CO2Ton + scope1CH4TonCO2e + scope1N2OTonCO2e;
  }, [scope1CO2Ton, scope1CH4TonCO2e, scope1N2OTonCO2e]);

  // Tổng phát thải gộp (tCO2e)
  // Điện lưới tính theo tCO2, được cộng hợp với tCO2e của Scope 1
  const grossEmissionsTCO2e = useMemo(() => {
    return scope1TotalTCO2e + scope2TotalTCO2;
  }, [scope1TotalTCO2e, scope2TotalTCO2]);

  // Dự án giảm phát thải tại nguồn do biến tần (nghiên cứu kỹ thuật độc lập)
  const onSiteReductionTCO2e = 42.5;

  // Tín chỉ carbon: CHỈ TÍNH LÔ MỨC 3 (ĐÃ RETIRE)
  const level3CreditsTCO2e = useMemo(() => {
    return creditBatches
      .filter((b) => b.evidenceLevel === 3)
      .reduce((sum, b) => sum + b.quantity, 0);
  }, [creditBatches]);

  const unretiredCreditsTCO2e = useMemo(() => {
    return creditBatches
      .filter((b) => b.evidenceLevel < 3)
      .reduce((sum, b) => sum + b.quantity, 0);
  }, [creditBatches]);

  // Actions
  const addRecord = (record: Omit<ActivityRecord, 'id' | 'timestamp'>, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền thêm dữ liệu.');
      return;
    }
    const newId = `act-${record.category}-${record.year}-${record.month.toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const newRecord: ActivityRecord = {
      ...record,
      id: newId,
      timestamp: new Date().toISOString(),
      enteredBy: getRoleName(role),
      enteredRole: role === 'data_entry' ? 'Cán bộ Môi trường' : 'Người duyệt',
    };
    setActivityRecords((prev) => [...prev, newRecord]);
    addAuditLog(
      'Thêm mới dòng dữ liệu',
      `${record.categoryLabel || record.categoryName} T${record.month}/${record.year}`,
      'Trống',
      `${record.value.toLocaleString('vi-VN')} ${record.unit} (Số HĐ: ${record.invoiceNumber})`,
      reason || 'Nhập liệu thủ công từ giao diện'
    );
  };

  const updateRecord = (id: string, updates: Partial<ActivityRecord>, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền sửa dữ liệu.');
      return;
    }
    const existing = activityRecords.find((r) => r.id === id);
    if (!existing) return;

    const oldDesc = `${existing.value.toLocaleString('vi-VN')} ${existing.unit} (HĐ: ${existing.invoiceNumber})`;
    const newRec = { ...existing, ...updates };
    const newDesc = `${newRec.value.toLocaleString('vi-VN')} ${newRec.unit} (HĐ: ${newRec.invoiceNumber})`;

    setActivityRecords((prev) => prev.map((r) => (r.id === id ? newRec : r)));
    addAuditLog(
      'Cập nhật dòng dữ liệu',
      `${existing.categoryLabel || existing.categoryName} T${existing.month}/${existing.year}`,
      oldDesc,
      newDesc,
      reason || 'Điều chỉnh thông tin hoặc đính kèm chứng từ'
    );
  };

  const deleteRecord = (id: string, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền xóa dữ liệu.');
      return;
    }
    const existing = activityRecords.find((r) => r.id === id);
    if (!existing) return;

    setActivityRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditLog(
      'Xóa dòng dữ liệu',
      `${existing.categoryLabel || existing.categoryName} T${existing.month}/${existing.year}`,
      `${existing.value.toLocaleString('vi-VN')} ${existing.unit} (HĐ: ${existing.invoiceNumber})`,
      'Đã xóa',
      reason || 'Xóa dòng dữ liệu lỗi'
    );
  };

  const quickFixAddJuly = () => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền thao tác dữ liệu.');
      return;
    }
    const exists = activityRecords.some(
      (r) => r.year === 2023 && r.month === 7 && r.category === 'electricity'
    );
    if (exists) return;

    setActivityRecords((prev) => [...prev, MISSING_JULY_ELECTRICITY_RECORD]);
    addAuditLog(
      'Bổ sung hóa đơn Tháng 7',
      'Điện lưới (Phạm vi 2) T07/2023',
      'Trống (Thiếu tháng 7 - Tình huống A)',
      '179.500 kWh (HĐ: HDDT-2023-EVN-07894, Tệp: EVN_HoaDon_T07_2023_07894.pdf)',
      'Bổ sung hóa đơn EVN Tháng 7 đối soát từ kế toán.'
    );
  };

  const updateEmissionFactor = (id: string, newValue: number, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền sửa hệ số.');
      return;
    }
    const factor = emissionFactors.find((f) => f.id === id);
    if (!factor) return;

    const oldValue = `${factor.value} ${factor.unit}`;
    const newStr = `${newValue} ${factor.unit}`;

    setEmissionFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: newValue } : f))
    );

    addAuditLog(
      'Cấu hình hệ số phát thải',
      `${factor.categoryName} (${factor.dataYear})`,
      oldValue,
      newStr,
      reason || 'Cập nhật cấu hình hệ số phát thải'
    );
  };

  const updateDieselParams = (params: Partial<DieselParameters>, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền sửa thông số.');
      return;
    }
    setDieselParams((prev) => ({ ...prev, ...params }));
    addAuditLog(
      'Cập nhật thông số dầu DO IPCC 2006',
      'Thông số hóa lý dầu DO',
      `rho=${dieselParams.density}, NCV=${dieselParams.ncv}`,
      JSON.stringify(params),
      reason || 'Điều chỉnh thông số tính toán dầu DO'
    );
  };

  const confirmDieselParameters = (advisorName: string, notes: string) => {
    if (role !== 'approver') {
      alert('Từ chối: Chỉ vai trò Người duyệt / Lãnh đạo mới có quyền xác nhận phê chuẩn thông số dầu DO.');
      return;
    }
    setDieselParams((prev) => ({
      ...prev,
      isConfirmedByAdvisor: true,
      advisorName: advisorName || 'Cố vấn Kỹ thuật Độc lập',
      confirmationDate: new Date().toISOString(),
      confirmationNotes: notes || 'Đã đối chiếu phiếu thử nghiệm chất lượng nhiên liệu Petrolimex',
    }));
    addAuditLog(
      'Xác nhận thông số dầu DO',
      'Thông số hóa lý dầu DO',
      'Chưa xác nhận — không dùng cho báo cáo đã duyệt',
      'Đã xác nhận bởi ' + (advisorName || 'Người duyệt'),
      notes || 'Hoàn tất đối soát thông số dầu DO để đủ điều kiện phê duyệt kỳ'
    );
  };

  const updateCreditBatchLevel = (id: string, newLevel: 0 | 1 | 2 | 3, reason: string) => {
    if (role === 'auditor') {
      alert('Từ chối: Vai trò Người kiểm tra (Chỉ đọc) không có quyền chuyển mức tín chỉ.');
      return;
    }
    const batch = creditBatches.find((b) => b.id === id);
    if (!batch) return;

    const oldLevelDesc = `Mức ${batch.evidenceLevel}: ${batch.evidenceTitle}`;

    let title = '';
    let desc = '';
    if (newLevel === 0) {
      title = 'Mức 0: Chưa có hồ sơ kiểm chứng';
      desc = 'Chưa có tài liệu kiểm chứng độc lập. Không đủ điều kiện tính toán.';
    } else if (newLevel === 1) {
      title = 'Mức 1: Có hồ sơ dự án (PDD)';
      desc = 'Đã có văn kiện thiết kế dự án (PDD) được phê duyệt nhưng chưa phát hành tín chỉ.';
    } else if (newLevel === 2) {
      title = 'Mức 2: Đã phát hành số sê-ri (Chưa retirement)';
      desc = 'Đã phát hành số sê-ri trên sổ đăng ký nhưng CHƯA RETIRE (chưa hủy lưu thông).';
    } else if (newLevel === 3) {
      title = 'Mức 3: Đã có bằng chứng Retirement (Đã hủy lưu thông)';
      desc = 'Đã có chứng nhận hủy bỏ lưu thông (Retirement) chỉ định đích danh cơ sở trên sổ đăng ký công khai.';
    }

    const updatedBatch: CreditBatch = {
      ...batch,
      evidenceLevel: newLevel,
      evidenceTitle: title,
      evidenceDescription: desc,
      retirementDetails:
        newLevel === 3
          ? {
              registryName: 'Verra Registry (Verra Impact Registry)',
              serialRange: batch.serialNumber,
              quantityRetired: batch.quantity,
              retiredDate: '2023-11-20',
              beneficiary: facility.companyName,
              purpose: 'Bù trừ phát thải tự nguyện nội bộ kỳ kiểm kê 2023',
              registryPublicUrl: 'https://registry.verra.org/my/public/retirement-cert/VCU-RET-2023-88912',
              certificateId: 'RET-CERT-2023-VN-88912',
            }
          : undefined,
    };

    setCreditBatches((prev) => prev.map((b) => (b.id === id ? updatedBatch : b)));
    addAuditLog(
      'Chuyển mức bằng chứng tín chỉ',
      `Lô tín chỉ ${batch.projectId} (${batch.quantity} tCO2e)`,
      oldLevelDesc,
      `Mức ${newLevel}: ${title}`,
      reason || 'Cập nhật bằng chứng kiểm tra tín chỉ carbon'
    );
  };

  const approveInventory = (): { success: boolean; message: string } => {
    // 1. Kiểm tra vai trò
    if (role !== 'approver') {
      return {
        success: false,
        message: 'Từ chối: Chỉ người dùng ở vai trò "Người duyệt" mới có thẩm quyền phê duyệt kỳ kiểm kê (Bạn đang ở vai trò Người nhập hoặc Người kiểm tra).',
      };
    }

    // 2. Kiểm tra lỗi chặn
    if (criticalIssuesCount > 0) {
      return {
        success: false,
        message: `Từ chối phê duyệt! Hệ thống phát hiện ${criticalIssuesCount} lỗi chặn chưa được xử lý. Bắt buộc khắc phục toàn bộ lỗi chặn trước khi phê duyệt.`,
      };
    }

    setFacility((prev) => ({
      ...prev,
      inventoryStatus: 'approved',
      approvalDate: new Date().toISOString(),
      approvedBy: getRoleName(role),
    }));

    addAuditLog(
      'Phê duyệt kỳ kiểm kê',
      `Kỳ kiểm kê phát thải năm ${activeYear}`,
      facility.inventoryStatus,
      'approved (Đã duyệt chính thức)',
      'Kỳ kiểm kê đã vượt qua 100% tiêu chí kiểm soát chất lượng dữ liệu.'
    );

    return {
      success: true,
      message: `Đã phê duyệt thành công kỳ kiểm kê ${activeYear} cho ${facility.facilityName}!`,
    };
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.FACTORS);
    localStorage.removeItem(STORAGE_KEYS.DIESEL_PARAMS);
    localStorage.removeItem(STORAGE_KEYS.CREDITS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.FACILITY);

    setFacility(INITIAL_FACILITY);
    setActivityRecords(INITIAL_ACTIVITY_RECORDS);
    setEmissionFactors(INITIAL_EMISSION_FACTORS);
    setDieselParams(INITIAL_DIESEL_PARAMETERS);
    setCreditBatches(INITIAL_CREDIT_BATCHES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    if (currentUser) {
      setRoleState(currentUser.role);
    }
    setActiveYear(2023);
    setActiveScreen('activity');
    setSelectedRecordForDoc(null);
    setSelectedFormulaForInspection(null);
    setIsAuditLogOpen(false);
  };

  return (
    <CarbonContext.Provider
      value={{
        role,
        setRole: setRoleState,
        currentUser,
        login,
        logout,
        facility,
        setFacility,
        activeYear,
        setActiveYear,
        activeScreen,
        setActiveScreen,
        activityRecords,
        emissionFactors,
        dieselParams,
        creditBatches,
        auditLogs,
        validationIssues,
        criticalIssuesCount,
        canApprove,
        scope1CO2Ton,
        scope1CH4TonCO2e,
        scope1N2OTonCO2e,
        scope1TotalTCO2e,
        scope2TotalTCO2,
        grossEmissionsTCO2e,
        onSiteReductionTCO2e,
        level3CreditsTCO2e,
        unretiredCreditsTCO2e,
        selectedRecordForDoc,
        setSelectedRecordForDoc,
        selectedFormulaForInspection,
        setSelectedFormulaForInspection,
        isAuditLogOpen,
        setIsAuditLogOpen,
        addRecord,
        updateRecord,
        deleteRecord,
        quickFixAddJuly,
        updateEmissionFactor,
        updateDieselParams,
        confirmDieselParameters,
        updateCreditBatchLevel,
        approveInventory,
        resetDemoData,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};
