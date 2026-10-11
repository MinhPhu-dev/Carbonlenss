import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';

export const DataQualityScreen: React.FC = () => {
  const {
    validationIssues,
    criticalIssuesCount,
    canApprove,
    quickFixAddJuly,
    approveInventory,
    facility,
    role,
    activeYear,
    setActiveScreen,
    dieselParams,
    confirmDieselParameters,
  } = useCarbon();

  const [approveNotification, setApproveNotification] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const criticalIssues = validationIssues.filter((i) => i.severity === 'critical');
  const warningIssues = validationIssues.filter((i) => i.severity === 'warning');

  const handleApproveClick = () => {
    const res = approveInventory();
    setApproveNotification({
      show: true,
      success: res.success,
      message: res.message,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B2D45] tracking-tight">Chất lượng dữ liệu & Phê duyệt</h1>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              Năm {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động kiểm tra thiếu số liệu, thiếu hóa đơn gốc và thông số chưa kiểm chứng trước khi duyệt.
          </p>
        </div>

        {/* Approval Button & Role indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Thẩm quyền hiện tại:</span>
            <span className="text-xs font-bold text-slate-800">
              {role === 'approver' ? (
                <span className="text-emerald-700 font-bold">Người duyệt (Trần Minh Đức)</span>
              ) : role === 'data_entry' ? (
                <span className="text-slate-600">Người nhập (Không có quyền duyệt)</span>
              ) : (
                <span className="text-blue-700">Người kiểm tra (Chỉ đọc)</span>
              )}
            </span>
          </div>

          <button
            onClick={handleApproveClick}
            disabled={facility.inventoryStatus === 'approved'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold shadow-xs transition-all ${
              facility.inventoryStatus === 'approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : canApprove
                ? 'bg-[#2E7D5B] hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300 cursor-pointer'
            }`}
            title="Phê duyệt kỳ kiểm kê"
          >
            {facility.inventoryStatus === 'approved' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã duyệt kỳ {activeYear}</span>
              </>
            ) : canApprove ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Phê duyệt kỳ kiểm kê</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-red-500" />
                <span>
                  {role !== 'approver'
                    ? 'Chặn duyệt (Sai vai trò)'
                    : `Chặn duyệt (${criticalIssuesCount} lỗi)`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {approveNotification && (
        <div
          className={`p-4 rounded-md border text-xs flex items-center justify-between ${
            approveNotification.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {approveNotification.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{approveNotification.message}</span>
          </div>
          <button
            onClick={() => setApproveNotification(null)}
            className="text-slate-500 hover:text-slate-800 p-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Critical Issues Section (Gatekeeper Blocking Approve) */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-red-50/80 px-4 py-3 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xs font-bold text-red-950 uppercase tracking-wide">
              Lỗi nghiêm trọng (Chặn phê duyệt) · {criticalIssues.length} vấn đề
            </h2>
          </div>
          <span className="text-[11px] text-red-700 font-semibold">
            Cần xử lý toàn bộ lỗi để mở khóa nút Duyệt
          </span>
        </div>

        <div className="p-4 space-y-3">
          {criticalIssues.length === 0 ? (
            <div className="p-5 text-center text-xs text-emerald-800 bg-emerald-50 rounded border border-emerald-200 flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="font-bold text-sm">Dữ liệu hợp lệ, không còn lỗi chặn</span>
              <span className="text-slate-600">
                Đã có đủ 12 tháng dữ liệu, đính kèm đầy đủ hóa đơn chứng từ và thông số dầu DO đã được xác nhận.
                {role !== 'approver' && (
                  <span className="text-[#C67C1A] block font-semibold mt-1">
                    * Đăng xuất và đăng nhập vào tài khoản "Trần Minh Đức — Người duyệt" để thực hiện duyệt kỳ kiểm kê.
                  </span>
                )}
              </span>
            </div>
          ) : (
            criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded border border-red-200 bg-red-50/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-900 text-sm">{issue.title}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-1.5 py-0.2 rounded font-bold uppercase">
                      Lỗi chặn
                    </span>
                  </div>
                  <p className="text-slate-700">{issue.description}</p>
                  <p className="text-[11px] text-red-800">
                    <span className="font-semibold">Hướng xử lý: </span>
                    {issue.suggestedAction}
                  </p>
                </div>

                {/* Quick action buttons */}
                <div className="shrink-0 flex items-center gap-2">
                  {issue.canQuickFix && (
                    <button
                      onClick={quickFixAddJuly}
                      disabled={role === 'auditor'}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#2E7D5B] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap disabled:opacity-50"
                      title="Bổ sung bản ghi và hóa đơn tháng 7"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Bổ sung HĐ Tháng 7</span>
                    </button>
                  )}
                  {issue.type === 'unconfirmed_diesel' && (
                    <button
                      onClick={() => {
                        confirmDieselParameters('Viện Khoa học & Công nghệ Môi trường (Cố vấn)', 'Xác nhận thông số dầu DO theo phiếu thử nghiệm xăng dầu Petrolimex số 8892/PTN');
                      }}
                      disabled={role !== 'approver'}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0B2D45] hover:bg-[#153e5e] text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap disabled:opacity-50"
                      title="Xác nhận thông số dầu DO"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Xác nhận thông số DO</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveScreen('activity')}
                    className="px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs whitespace-nowrap"
                  >
                    Xem dữ liệu
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Warning Issues Section */}
      {warningIssues.length > 0 && (
        <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C67C1A]" />
              <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Cảnh báo biến động dữ liệu · {warningIssues.length} vấn đề
              </h2>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Không chặn phê duyệt nhưng cần giải trình
            </span>
          </div>

          <div className="p-4 space-y-3">
            {warningIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded border border-amber-200 bg-amber-50/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{issue.title}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                      Cảnh báo
                    </span>
                  </div>
                  <p className="text-slate-700">{issue.description}</p>
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold">Đề xuất: </span>
                    {issue.suggestedAction}
                  </p>
                </div>

                <button
                  onClick={() => setActiveScreen('activity')}
                  className="shrink-0 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Xem dòng dữ liệu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
