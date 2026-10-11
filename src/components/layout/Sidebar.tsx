import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import {
  FileSpreadsheet,
  Calculator,
  ShieldAlert,
  Coins,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Info,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    criticalIssuesCount,
    validationIssues,
    facility,
    role,
    currentUser,
  } = useCarbon();

  const totalWarnings = validationIssues.filter((i) => i.severity === 'warning').length;

  const navItems = [
    {
      id: 'activity' as const,
      label: 'Dữ liệu hoạt động',
      sublabel: 'Điện lưới & Dầu DO 12 tháng',
      icon: FileSpreadsheet,
    },
    {
      id: 'results' as const,
      label: 'Kết quả & công thức',
      sublabel: 'Phạm vi 1, 2 & Thư viện EF',
      icon: Calculator,
    },
    {
      id: 'quality' as const,
      label: 'Chất lượng dữ liệu',
      sublabel: 'Kiểm tra lỗi & Chặn duyệt',
      icon: ShieldAlert,
      badge: criticalIssuesCount > 0 ? (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
          {criticalIssuesCount} lỗi
        </span>
      ) : totalWarnings > 0 ? (
        <span className="bg-[#C67C1A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
          {totalWarnings} cảnh báo
        </span>
      ) : (
        <span className="text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </span>
      ),
    },
    {
      id: 'credits' as const,
      label: 'Hồ sơ tín chỉ',
      sublabel: 'Danh mục lô và bằng chứng',
      icon: Coins,
    },
    {
      id: 'report' as const,
      label: 'Báo cáo phát thải',
      sublabel: 'Kiểm kê & Tuyên bố',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B2D45] text-slate-200 flex flex-col shrink-0 border-r border-[#0B2D45]/40 no-print select-none">
      {/* Facility overview box */}
      <div className="p-4 border-b border-white/10 bg-black/15">
        <div className="flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate" title={facility.facilityName}>
              {facility.facilityName}
            </h2>
            <p className="text-[11px] text-slate-300 truncate" title={facility.companyName}>
              {facility.companyName}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Trạng thái:</span>
              {facility.inventoryStatus === 'approved' ? (
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Đã duyệt kỳ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                  <Clock className="w-3 h-3" /> Chưa duyệt (Nháp)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between transition-all group ${
                isActive
                  ? 'bg-[#2E7D5B] text-white font-medium shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <div className="truncate">
                  <div className="text-xs font-semibold leading-tight">{item.label}</div>
                  <div className={`text-[10px] leading-tight truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>
              {item.badge && <div className="ml-2 shrink-0">{item.badge}</div>}
            </button>
          );
        })}
      </nav>

      {/* User account context */}
      <div className="p-3 border-t border-white/10 bg-black/20 text-[11px] text-slate-300">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Tài khoản người dùng</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-slate-200">
            {currentUser?.roleLabel || (role === 'data_entry' ? 'Người nhập dữ liệu' : role === 'approver' ? 'Người duyệt' : 'Người kiểm tra, chỉ đọc')}
          </span>
        </div>
        <p className="font-medium text-white truncate">
          {currentUser?.name || (role === 'data_entry' ? 'Nguyễn Văn An' : role === 'approver' ? 'Trần Minh Đức' : 'Phan Thanh Hải')}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{currentUser?.title || 'Phòng An toàn - Môi trường (EHS)'}</p>
      </div>
    </aside>
  );
};
