import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { RotateCcw, History, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    facility,
    activeYear,
    setActiveYear,
    resetDemoData,
    setIsAuditLogOpen,
    auditLogs,
  } = useCarbon();

  return (
    <header className="bg-[#0B2D45] text-white border-b border-[#0B2D45]/40 px-6 py-3 shrink-0 no-print">
      <div className="flex items-center justify-between gap-6 max-w-full">
        {/* Zone 1: Wordmark & Facility Label */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#2E7D5B] flex items-center justify-center font-bold text-white text-base tracking-wider shadow-sm">
              CL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">CarbonLens</span>
              </div>
              <p className="text-[11px] text-slate-300">Quản lý phát thải & Hồ sơ carbon truy xuất</p>
            </div>
          </div>

          <div className="hidden xl:block h-6 w-[1px] bg-white/20 mx-1" />

          {/* Facility context */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300">
            <span className="font-medium text-white">{facility.facilityName}</span>
          </div>
        </div>

        {/* Zone 2: Year Selector & Audit Logs button */}
        <div className="flex items-center gap-3">
          {/* Reporting year */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded text-xs border border-white/10">
            <span className="text-slate-300">Năm:</span>
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(Number(e.target.value))}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-1"
            >
              <option value={2023} className="bg-[#0B2D45] text-white">2023</option>
              <option value={2024} className="bg-[#0B2D45] text-white">2024</option>
            </select>
          </div>

          {/* Audit Logs button */}
          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-white/10 hover:bg-white/15 text-slate-200 transition-colors whitespace-nowrap"
            title="Xem nhật ký thay đổi"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nhật ký thay đổi</span>
            <span className="bg-[#2E7D5B] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Zone 3: User Info, Logout & Reset Demo Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Reset Demo State Button */}
          <button
            onClick={() => {
              if (window.confirm('Đặt lại dữ liệu mẫu về trạng thái ban đầu?')) {
                resetDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#C67C1A] hover:bg-[#a96614] text-white shadow-sm transition-colors whitespace-nowrap"
            title="Đặt lại dữ liệu mẫu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại dữ liệu mẫu</span>
          </button>

          {/* User badge */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded border border-white/15 text-xs">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-white block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-slate-300 block leading-tight">{currentUser.roleLabel}</span>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors whitespace-nowrap border border-white/10"
            title="Đăng xuất khỏi phiên mô phỏng"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
