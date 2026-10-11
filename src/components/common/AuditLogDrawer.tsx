import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { X, History, Search, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const AuditLogDrawer: React.FC = () => {
  const { isAuditLogOpen, setIsAuditLogOpen, auditLogs } = useCarbon();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuditLogOpen) return null;

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-[#0B2D45] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 rounded border border-emerald-400/30">
              <History className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Nhật ký thay đổi</h3>
              </div>
              <p className="text-xs text-slate-300">
                Lưu vết người sửa, thời điểm, giá trị cũ, giá trị mới và lý do thay đổi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditLogOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo đối tượng, người sửa hoặc lý do..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:border-[#2E7D5B] focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">
            {filteredLogs.length}/{auditLogs.length} mục
          </span>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Không tìm thấy dòng nhật ký phù hợp với bộ lọc tìm kiếm.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs text-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    <span className="font-semibold">{log.userName}</span>
                    <span className="text-slate-400">({log.userRole})</span>
                  </div>
                  <span className="text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Target & Action */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B2D45] text-xs">{log.target}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {log.action}
                  </span>
                </div>

                {/* Old vs New Value Diff */}
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 w-16 shrink-0">Giá trị cũ:</span>
                    <span className="text-slate-600 line-through font-mono break-all">{log.oldValue}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#2E7D5B] font-semibold w-16 shrink-0 flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3 inline" /> Mới:
                    </span>
                    <span className="text-slate-900 font-semibold font-mono break-all">{log.newValue}</span>
                  </div>
                </div>

                {/* Reason */}
                <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-200/60">
                  <span className="font-semibold text-amber-900">Lý do điều chỉnh: </span>
                  {log.reason}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mọi hành động đều ghi nhận vào chuỗi truy xuất bất biến</span>
          </div>
          <button
            onClick={() => setIsAuditLogOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
