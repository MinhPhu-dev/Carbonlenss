import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { CreditBatch, EvidenceLevel } from '../../types';
import {
  Coins,
  ShieldCheck,
  ShieldAlert,
  FileText,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  Building,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const CreditsRegistryScreen: React.FC = () => {
  const {
    creditBatches,
    updateCreditBatchLevel,
    facility,
    role,
    level3CreditsTCO2e,
    unretiredCreditsTCO2e,
  } = useCarbon();

  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<CreditBatch | null>(null);

  const getEvidenceBadge = (level: EvidenceLevel) => {
    switch (level) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Mức 0: Chưa có hồ sơ kiểm chứng
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Mức 1: Có hồ sơ thiết kế dự án (PDD)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-950 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-[#C67C1A]" />
            Mức 2: Chưa retirement — chưa có bằng chứng hủy tín chỉ
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Mức 3: Đã có bằng chứng retirement (Đã hủy lưu thông)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B2D45] tracking-tight">Hồ sơ tín chỉ carbon</h1>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              4 mức bằng chứng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các lô tín chỉ carbon theo cấp độ bằng chứng từ Mức 0 đến Mức 3 (Retirement).
          </p>
        </div>
      </div>

      {/* 4 Internal Evidence Levels Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded border border-slate-200 text-xs">
          <div className="font-bold text-slate-700 mb-1">Mức 0 · Chưa kiểm chứng</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Thỏa thuận ghi nhớ nội bộ, tài trợ vườn ươm. Chưa có phương pháp luận hoặc kiểm toán thứ 3.
          </p>
          <span className="text-[10px] text-red-600 font-bold block mt-1.5">Không dùng cho bù trừ</span>
        </div>

        <div className="p-3 bg-white rounded border border-slate-200 text-xs">
          <div className="font-bold text-blue-900 mb-1">Mức 1 · Hồ sơ dự án (PDD)</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Đã đăng ký văn kiện PDD trên cổng tiêu chuẩn nhưng chưa thẩm tra phát hành tín chỉ thực tế.
          </p>
          <span className="text-[10px] text-amber-700 font-bold block mt-1.5">Chưa có tín chỉ phát hành</span>
        </div>

        <div className="p-3 bg-amber-50/70 rounded border border-amber-300 text-xs">
          <div className="font-bold text-amber-950 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C67C1A]" />
            <span>Mức 2 · Đã phát hành (Chưa retire)</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Có số sê-ri định danh nhưng <strong>CHƯA RETIRE</strong>. Chưa có bằng chứng hủy khỏi lưu thông trên sổ đăng ký.
          </p>
          <span className="text-[10px] text-red-700 font-bold block mt-1.5">
            Tín chỉ không được dùng để bù trừ phát thải trong báo cáo này
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded border border-emerald-300 text-xs">
          <div className="font-bold text-emerald-950 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D5B]" />
            <span>Mức 3 · Bằng chứng Retirement</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Đã hủy lưu thông vĩnh viễn trên sổ đăng ký với mã chứng chỉ và bên thụ hưởng đích danh.
          </p>
          <span className="text-[10px] text-[#2E7D5B] font-bold block mt-1.5">
            Đủ điều kiện ghi nhận (Báo cáo riêng)
          </span>
        </div>
      </div>

      {/* Credit Batches Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#0B2D45] uppercase tracking-wide">
            Danh mục các lô tín chỉ carbon ({creditBatches.length} lô)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Tổng: {creditBatches.reduce((sum, b) => sum + b.quantity, 0).toLocaleString('vi-VN')} tCO2e
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Mã dự án & Tên dự án</th>
                <th className="py-2.5 px-3">Chương trình / Tiêu chuẩn</th>
                <th className="py-2.5 px-3">Vintage</th>
                <th className="py-2.5 px-3 text-right">Số lượng (tCO2e)</th>
                <th className="py-2.5 px-3">Mức bằng chứng nội bộ</th>
                <th className="py-2.5 px-3">Dải số Sê-ri định danh</th>
                <th className="py-2.5 px-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditBatches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => setSelectedBatchForDetail(batch)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#0B2D45]">{batch.projectId}</div>
                    <div className="text-[11px] text-slate-600 truncate max-w-xs" title={batch.projectName}>
                      {batch.projectName}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {batch.program}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {batch.vintageYear}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {batch.quantity.toLocaleString('vi-VN')}
                  </td>

                  <td className="py-2.5 px-3">
                    {getEvidenceBadge(batch.evidenceLevel)}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 max-w-xs truncate" title={batch.serialNumber}>
                    {batch.serialNumber}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatchForDetail(batch);
                      }}
                      className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold"
                    >
                      Xem hồ sơ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Details Modal */}
      {selectedBatchForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#0B2D45] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider block">
                  {selectedBatchForDetail.program}
                </span>
                <h3 className="font-bold text-base text-white">
                  {selectedBatchForDetail.projectId}: {selectedBatchForDetail.projectName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatchForDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs bg-[#F8FAFC]">
              {/* Data Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Dữ liệu minh họa cơ sở</span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Chưa bù trừ vào kiểm kê
                </span>
              </div>

              {/* Status Box */}
              <div
                className={`p-4 rounded-md border ${
                  selectedBatchForDetail.evidenceLevel === 3
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : selectedBatchForDetail.evidenceLevel === 2
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm">{selectedBatchForDetail.evidenceTitle}</span>
                  {getEvidenceBadge(selectedBatchForDetail.evidenceLevel)}
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {selectedBatchForDetail.evidenceDescription}
                </p>

                {selectedBatchForDetail.evidenceLevel === 2 && (
                  <div className="mt-3 p-3 bg-red-100/70 rounded border border-red-300 text-red-950 font-bold text-[11px]">
                    <span className="block mb-0.5">KẾT LUẬN KIỂM SOÁT CARBONLENS:</span>
                    "Tín chỉ không được dùng để bù trừ phát thải trong báo cáo này" do chưa có bằng chứng hủy (retirement) khỏi sổ đăng ký lưu thông.
                  </div>
                )}
              </div>

              {/* Complete Retirement Fields for Level 3 */}
              {selectedBatchForDetail.evidenceLevel === 3 && selectedBatchForDetail.retirementDetails && (
                <div className="bg-white p-4 rounded-md border border-emerald-300 space-y-3">
                  <span className="font-bold text-emerald-900 block text-xs uppercase tracking-wide">
                    Hồ sơ chi tiết bằng chứng Retirement (Bắt buộc để đối soát):
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-emerald-50/50 p-3 rounded border border-emerald-200">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Sổ đăng ký quốc tế:</span>
                      <span className="font-semibold text-slate-900">{selectedBatchForDetail.retirementDetails.registryName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mã chứng chỉ hủy (Certificate ID):</span>
                      <span className="font-mono font-bold text-slate-900">{selectedBatchForDetail.retirementDetails.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Ngày thực hiện retirement:</span>
                      <span className="font-mono text-slate-900">{selectedBatchForDetail.retirementDetails.retiredDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Số lượng đã hủy:</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedBatchForDetail.retirementDetails.quantityRetired.toLocaleString('vi-VN')} tCO2e</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Bên thụ hưởng (Beneficiary):</span>
                      <span className="font-bold text-slate-900">{selectedBatchForDetail.retirementDetails.beneficiary}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Mục đích hủy:</span>
                      <span className="text-slate-700">{selectedBatchForDetail.retirementDetails.purpose}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Liên kết tra cứu công khai:</span>
                      <span className="font-mono text-blue-700 underline flex items-center gap-1">
                        <span>Tra cứu trên sổ đăng ký công khai</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="bg-white p-4 rounded-md border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block">Số lượng tín chỉ:</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {selectedBatchForDetail.quantity.toLocaleString('vi-VN')} tCO2e
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Năm phát hành (Vintage):</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedBatchForDetail.vintageYear}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Dải số sê-ri định danh:</span>
                  <span className="font-mono text-slate-800 text-[11px] break-all bg-slate-50 p-2 rounded border border-slate-200 block mt-1">
                    {selectedBatchForDetail.serialNumber}
                  </span>
                </div>
              </div>

              {/* Proof Level Switcher */}
              {role !== 'auditor' && (
                <div className="p-3 bg-slate-100 rounded border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">
                    Cập nhật cấp độ bằng chứng hồ sơ:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateCreditBatchLevel(selectedBatchForDetail.id, 2, 'Chuyển về Mức 2 (chưa có chứng chỉ retirement)');
                        setSelectedBatchForDetail((prev) => prev ? { ...prev, evidenceLevel: 2 } : null);
                      }}
                      className={`px-3 py-1.5 rounded font-semibold text-xs border ${
                        selectedBatchForDetail.evidenceLevel === 2
                          ? 'bg-amber-100 border-amber-400 text-amber-950'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Đặt về Mức 2 (Chưa retirement)
                    </button>
                    <button
                      onClick={() => {
                        updateCreditBatchLevel(selectedBatchForDetail.id, 3, 'Bổ sung chứng chỉ retirement đích danh');
                        setSelectedBatchForDetail((prev) => prev ? { ...prev, evidenceLevel: 3 } : null);
                      }}
                      className={`px-3 py-1.5 rounded font-semibold text-xs border ${
                        selectedBatchForDetail.evidenceLevel === 3
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Chuyển Mức 3 (Đã có chứng chỉ Retirement)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBatchForDetail(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
