import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Hash, Calendar, Building, Zap, Fuel } from 'lucide-react';

export const DocumentViewerModal: React.FC = () => {
  const { selectedRecordForDoc, setSelectedRecordForDoc } = useCarbon();

  if (!selectedRecordForDoc) return null;

  const rec = selectedRecordForDoc;
  const isElec = rec.category === 'electricity';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B2D45] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Chứng từ đối soát</h3>
              </div>
              <p className="text-xs text-slate-300">
                Hóa đơn: <span className="font-mono font-semibold text-white">{rec.invoiceNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRecordForDoc(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Body (Simulated Electronic Bill) */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
          {/* Simulated Stamp / Header */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs relative">
            <div className="absolute top-4 right-4 flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-mono">Mã bản ghi: {rec.id}</span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              {isElec ? (
                <Zap className="w-5 h-5 text-[#2E7D5B]" />
              ) : (
                <Fuel className="w-5 h-5 text-[#C67C1A]" />
              )}
              <h4 className="font-bold text-[#0B2D45] text-sm">
                {isElec ? 'HÓA ĐƠN TIỀN ĐIỆN TỬ - TẬP ĐOÀN ĐIỆN LỰC VIỆT NAM' : 'HÓA ĐƠN BÁN HÀNG NHIÊN LIỆU XĂNG DẦU'}
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Đơn vị phát hành:{' '}
              <span className="font-medium text-slate-800">
                {rec.attachmentMeta?.issuer || (isElec ? 'Công ty Điện lực Bắc Ninh' : 'Công ty Xăng dầu Petrolimex Bắc Ninh')}
              </span>
            </p>

            <div className="my-4 border-t border-slate-100" />

            {/* Grid of invoice details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Kỳ sử dụng / Kiểm kê:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  Tháng {rec.month.toString().padStart(2, '0')}/{rec.year}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Số hóa đơn điện tử:</span>
                <span className="font-semibold text-slate-800 font-mono text-sm text-[#0B2D45]">
                  {rec.invoiceNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Khách hàng / Cơ sở:</span>
                <span className="font-medium text-slate-800">Công ty CP Chế tạo Cơ khí An Phát (Nhà máy 2)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mã số thuế cơ sở:</span>
                <span className="font-mono text-slate-700">2301198823</span>
              </div>
              {rec.attachmentMeta?.meterCode && (
                <div>
                  <span className="text-slate-500 block">Mã công tơ đo đếm:</span>
                  <span className="font-mono text-slate-700">{rec.attachmentMeta.meterCode}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block">Ngày phát hành hóa đơn:</span>
                <span className="font-mono text-slate-700">{rec.attachmentMeta?.issueDate || '2023-08-04'}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="mt-5 border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Nội dung hàng hóa / dịch vụ</th>
                    <th className="p-2.5 text-right">Số lượng</th>
                    <th className="p-2.5">Đơn vị</th>
                    <th className="p-2.5 text-right">Tổng thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-800">
                      {isElec
                        ? 'Điện năng thương phẩm 3 giá (Giờ bình thường + cao điểm + thấp điểm)'
                        : 'Dầu Diesel 0.05S tiêu thụ cho lò hơi sấy và máy phát điện'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {rec.value.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-2.5 font-medium text-slate-600">{rec.unit}</td>
                    <td className="p-2.5 text-right font-mono font-medium text-slate-800">
                      {(rec.attachmentMeta?.totalAmountVND || (isElec ? rec.value * 1900 : rec.value * 22500)).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Traceability Audit Box */}
            <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-200 text-xs">
              <div className="flex items-center gap-1.5 text-[#2E7D5B] font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Dấu kiểm tra truy xuất CarbonLens</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Dữ liệu hoạt động này đã được đối soát với tệp đính kèm{' '}
                <span className="font-mono font-semibold text-slate-800">{rec.attachmentName}</span>. Người tiếp nhận:{' '}
                <span className="font-medium text-slate-800">{rec.enteredBy}</span> ({rec.enteredRole}) vào thời điểm{' '}
                <span className="font-mono text-slate-700">{new Date(rec.timestamp).toLocaleString('vi-VN')}</span>.
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Chữ ký số băm: {rec.attachmentMeta?.hashValidation || 'SHA256:4a88...19fe'}</span>
                <span className="text-emerald-700 font-semibold">TOÀN VẸN</span>
              </div>
            </div>

            {rec.notes && (
              <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-600">
                <span className="font-semibold text-slate-700">Ghi chú đối soát: </span>
                {rec.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Tệp: {rec.attachmentName || 'Chứng từ chưa tải lên'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRecordForDoc(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
