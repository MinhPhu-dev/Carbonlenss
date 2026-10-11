import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import {
  FileText,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Fuel,
  Zap,
  Info,
  Download,
} from 'lucide-react';

export const ReportScreen: React.FC = () => {
  const {
    facility,
    activeYear,
    scope1CO2Ton,
    scope1CH4TonCO2e,
    scope1N2OTonCO2e,
    scope1TotalTCO2e,
    scope2TotalTCO2,
    grossEmissionsTCO2e,
    onSiteReductionTCO2e,
    creditBatches,
    level3CreditsTCO2e,
    unretiredCreditsTCO2e,
    emissionFactors,
    dieselParams,
  } = useCarbon();

  const handlePrint = () => {
    window.print();
  };

  const level3Batches = creditBatches.filter((b) => b.evidenceLevel === 3);
  const unretiredBatches = creditBatches.filter((b) => b.evidenceLevel < 3);

  const currentElecFactor =
    emissionFactors.find((f) => f.category === 'electricity' && f.dataYear === activeYear) ||
    emissionFactors.find((f) => f.category === 'electricity')!;

  const hasOnlyLevel2OrBelow = level3Batches.length === 0;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B2D45] tracking-tight">Báo cáo phát thải</h1>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              Năm {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo tổng hợp phát thải Phạm vi 1, Phạm vi 2, giảm phát thải tại nguồn và hồ sơ tín chỉ.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0B2D45] hover:bg-[#153e5e] rounded shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Xuất PDF / In báo cáo</span>
        </button>
      </div>

      {/* Main Report Document Sheet (Styled for Screen and Optimized for Print) */}
      <div className="bg-white rounded-md border border-slate-300 shadow-sm p-8 print-page space-y-7 text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-[#0B2D45] pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black text-[#0B2D45] tracking-tight">CARBONLENS</span>
                <span className="text-xs font-bold text-slate-400">|</span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  BÁO CÁO DỮ LIỆU PHÁT THẢI & HỒ SƠ CARBON TRUY XUẤT
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0B2D45] mt-2">
                BÁO CÁO KIỂM KÊ PHÁT THẢI KHÍ NHÀ KÍNH (NĂM {activeYear})
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-block text-[11px] font-bold text-[#C67C1A] border border-[#C67C1A] px-2.5 py-0.5 rounded uppercase tracking-wide">
                Dữ liệu minh họa
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Mã hồ sơ: CL-INV-{activeYear}-FAC02
              </p>
            </div>
          </div>

          {/* Facility metadata grid */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Tên doanh nghiệp:</span>
              <span className="font-semibold text-slate-800">{facility.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cơ sở phát thải:</span>
              <span className="font-semibold text-slate-800">{facility.facilityName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Ranh giới kiểm kê:</span>
              <span className="text-slate-700">Điện lưới (Scope 2) và Đốt dầu DO cố định (Scope 1)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Trạng thái phê duyệt:</span>
              <span className="font-bold text-[#2E7D5B] font-mono">
                {facility.inventoryStatus === 'approved' ? 'ĐÃ PHÊ DUYỆT CHÍNH THỨC' : 'BẢN NHÁP (CHƯA DUYỆT)'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: TỔNG PHÁT THẢI GỘP */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h3 className="font-bold text-sm text-[#0B2D45] uppercase tracking-wide">
              Phần 1: Tổng phát thải gộp (Gross Emissions)
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Tổng cộng: {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Báo cáo độc lập tổng phát thải thực tế phát sinh tại ranh giới cơ sở, không trừ bất kỳ chứng chỉ hay khoản đầu tư tín chỉ nào.
          </p>

          <table className="w-full text-xs text-left border border-slate-200 rounded">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Phân loại phạm vi</th>
                <th className="p-2.5">Nguồn tiêu thụ</th>
                <th className="p-2.5 text-right">Dữ liệu hoạt động</th>
                <th className="p-2.5 text-right">Hệ số & Phương pháp</th>
                <th className="p-2.5 text-right">Phát thải</th>
                <th className="p-2.5 text-right">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2.5 font-bold text-slate-800">Phạm vi 1 (Scope 1)</td>
                <td className="p-2.5 text-slate-600">Đốt dầu DO cố định máy phát & lò hơi sấy sơn (Nhà máy cơ khí)</td>
                <td className="p-2.5 text-right font-mono">54.600 lít</td>
                <td className="p-2.5 text-right font-mono text-[11px]">
                  IPCC 2006 Vol 2 Bảng 2.3 (ρ=0,84 kg/l; NCV=43,0 TJ/Gg; EF_CO2=74.100 kg/TJ; CH4: 3 kg/TJ × GWP 28; N2O: 0,6 kg/TJ × GWP 265)
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                  {scope1TotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                </td>
                <td className="p-2.5 text-right font-mono text-slate-600">
                  {((scope1TotalTCO2e / (grossEmissionsTCO2e || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-800">Phạm vi 2 (Scope 2)</td>
                <td className="p-2.5 text-slate-600">Điện năng tiêu thụ từ lưới điện EVN</td>
                <td className="p-2.5 text-right font-mono">
                  {(scope2TotalTCO2 / currentElecFactor.value * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} kWh
                </td>
                <td className="p-2.5 text-right font-mono">
                  0,6592 tCO2/MWh (CV 1726/BĐKH-PTCBT ngày 03/12/2024)
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                  {scope2TotalTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2
                </td>
                <td className="p-2.5 text-right font-mono text-slate-600">
                  {((scope2TotalTCO2 / (grossEmissionsTCO2e || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="p-2.5 text-slate-800">
                  TỔNG PHÁT THẢI GỘP PHẠM VI 1 VÀ 2 (GROSS TOTAL)
                </td>
                <td className="p-2.5 text-right font-mono text-base text-[#0B2D45]">
                  {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                </td>
                <td className="p-2.5 text-right font-mono">100,0%</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* SECTION 2: GIẢM PHÁT THẢI TẠI NGUỒN */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h3 className="font-bold text-sm text-[#0B2D45] uppercase tracking-wide">
              Phần 2: Giảm phát thải tại nguồn (On-site Energy Efficiency)
            </h3>
            <span className="text-xs font-semibold text-[#2E7D5B] font-mono">
              Ước tính dự án: {onSiteReductionTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 1 })} tCO2e
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dự án cải tiến công nghệ lắp biến tần cho động cơ dập khuôn và thu hồi nhiệt lò sấy sơn.
          </p>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">
                  Nghiên cứu dự án hiệu quả năng lượng nội bộ (Biên bản kỹ thuật EE-2023-01)
                </span>
                <p className="text-[11px] text-slate-500">
                  Đường cơ sở kỹ thuật được xây dựng từ số liệu đo công suất động cơ trước và sau lắp biến tần.
                </p>
              </div>
              <span className="font-mono font-bold text-[#2E7D5B] text-sm">
                -{onSiteReductionTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 1 })} tCO2e
              </span>
            </div>
            <p className="text-[11px] text-slate-600 italic border-t border-slate-200 pt-1.5">
              * Nguyên tắc báo cáo liêm chính: Giảm phát thải tại nguồn đã phản ánh trực tiếp vào chỉ số công tơ điện và lượng mua dầu thực tế trong Phần 1. Việc lượng hóa giảm phát thải dự án được trình bày độc lập, không trừ thêm một lần nữa vào phát thải gộp.
            </p>
          </div>
        </section>

        {/* SECTION 3: TÍN CHỈ CARBON */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h3 className="font-bold text-sm text-[#0B2D45] uppercase tracking-wide">
              Phần 3: Tín chỉ carbon (Carbon Credits) · Chỉ tính lô Mức 3
            </h3>
            <span className="text-xs font-semibold font-mono text-slate-700">
              Tín chỉ có bằng chứng retirement (Mức 3): {level3CreditsTCO2e.toLocaleString('vi-VN')} tCO2e
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Theo nguyên tắc GHG Protocol, tín chỉ và các hoạt động liên quan phải trình bày ở phần riêng biệt và độc lập với kiểm kê phát thải.
          </p>

          {/* Table of Level 3 credits */}
          <div className="border border-slate-200 rounded overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Mã lô tín chỉ</th>
                  <th className="p-2.5">Sổ đăng ký & Tiêu chuẩn</th>
                  <th className="p-2.5">Mức bằng chứng nội bộ</th>
                  <th className="p-2.5 text-right">Số lượng (tCO2e)</th>
                  <th className="p-2.5">Chứng chỉ Retirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {level3Batches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic bg-slate-50">
                      Hiện tại cơ sở chưa có lô tín chỉ nào đạt Mức 3 (đã hủy lưu thông có chứng chỉ retirement).
                    </td>
                  </tr>
                ) : (
                  level3Batches.map((b) => (
                    <tr key={b.id} className="bg-emerald-50/30">
                      <td className="p-2.5 font-bold text-slate-900">{b.projectId}</td>
                      <td className="p-2.5 text-slate-600">{b.program}</td>
                      <td className="p-2.5 font-bold text-emerald-700">Mức 3: Đã Retirement</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-800">
                        {b.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 text-[11px]">
                        {b.retirementDetails?.certificateId || 'Đã xác nhận hủy'} ({b.retirementDetails?.retiredDate})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Unretired Batches Warning List */}
          {unretiredBatches.length > 0 && (
            <div className="p-3.5 bg-amber-50 rounded border border-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                <AlertTriangle className="w-4 h-4 text-[#C67C1A]" />
                <span>Các lô tín chỉ đang lưu giữ nhưng CHƯA ĐỦ ĐIỀU KIỆN BÙ TRỪ ({unretiredCreditsTCO2e.toLocaleString('vi-VN')} tCO2e):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-800 text-[11px]">
                {unretiredBatches.map((b) => (
                  <li key={b.id}>
                    <span className="font-bold text-slate-950">{b.projectId}</span> ({b.quantity} tCO2e, Vintage {b.vintageYear}) -{' '}
                    <span className="font-semibold text-amber-950">{b.evidenceTitle}</span>:{' '}
                    <span className="text-red-700 font-bold">
                      "Tín chỉ không được dùng để bù trừ phát thải trong báo cáo này"
                    </span> do chưa có bằng chứng hủy (retirement) khỏi lưu thông trên sổ đăng ký.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* SECTION 4: PHẠM VI TUYÊN BỐ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h3 className="font-bold text-sm text-[#0B2D45] uppercase tracking-wide">
              Phần 4: Phạm vi tuyên bố & Kết luận liêm chính
            </h3>
            <span className="text-xs font-bold text-[#C67C1A] uppercase tracking-wide">
              Nguyên tắc không cấn trừ gộp
            </span>
          </div>

          {/* Automated Statement */}
          <div className="bg-[#F8FAFC] p-4 rounded-md border border-slate-300 text-xs space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" />
              <span>NỘI DUNG TUYÊN BỐ PHÁT THẢI (HỆ THỐNG TỰ ĐỘNG TẠO):</span>
            </div>

            <div className="p-4 bg-white rounded border border-slate-200 text-slate-800 leading-relaxed font-serif text-[13px] shadow-2xs space-y-2">
              <p>
                "Trong kỳ kiểm kê năm <strong>{activeYear}</strong>, trong phạm vi kiểm kê (điện lưới và đốt dầu DO), cơ sở <strong>{facility.facilityName}</strong> thuộc <strong>{facility.companyName}</strong> có tổng phát thải khí nhà kính gộp là{' '}
                <strong className="text-[#0B2D45] font-mono text-sm">
                  {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                </strong>{' '}
                (trong đó Phạm vi 1 là {scope1TotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e từ đốt dầu DO theo IPCC 2006 Vol 2 Bảng 2.3 và Phạm vi 2 là {scope2TotalTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2 từ điện lưới theo Công văn số 1726/BĐKH-PTCBT ngày 03 tháng 12 năm 2024).
              </p>

              {hasOnlyLevel2OrBelow ? (
                <p className="text-slate-900">
                  Đối với các lô tín chỉ carbon đang theo dõi (bao gồm lô <strong>VCS-1844: {unretiredCreditsTCO2e} tCO2e</strong>), do hiện tại hồ sơ chỉ đạt <strong>Mức 2 (chưa retirement — chưa có bằng chứng hủy tín chỉ)</strong>, hệ thống ghi nhận:{' '}
                  <span className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-bold">
                    Tín chỉ không được dùng để bù trừ phát thải trong báo cáo này
                  </span>
                  . Do đó, cơ sở <strong>tuyệt đối không được đưa ra bất kỳ tuyên bố nào về 'Trung hòa carbon', 'Net Zero' hay 'Bù đắp phát thải'</strong> cho kỳ kiểm kê {activeYear}."
                </p>
              ) : (
                <p className="text-slate-900">
                  Cơ sở đã ghi nhận {level3CreditsTCO2e} tCO2e tín chỉ đạt Mức 3 (đã có bằng chứng retirement đích danh cơ sở). Tuy nhiên, tuân thủ nguyên tắc báo cáo liêm chính của GHG Protocol,{' '}
                  <strong>tổng phát thải gộp của cơ sở vẫn giữ nguyên là {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e</strong> và không được cấn trừ trực tiếp làm giảm phát thải kiểm kê."
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Signatures */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-6 text-xs text-center">
          <div>
            <span className="font-bold text-slate-700 block">NGƯỜI LẬP BÁO CÁO</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Cán bộ Môi trường EHS</p>
            <div className="h-12 flex items-end justify-center font-serif text-slate-800 font-bold italic">
              Nguyễn Văn An
            </div>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">NGƯỜI PHÊ DUYỆT CƠ SỞ</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Trưởng ban Môi trường</p>
            <div className="h-12 flex items-end justify-center font-serif text-slate-800 font-bold italic">
              {facility.inventoryStatus === 'approved' ? (
                <div className="flex flex-col items-center">
                  <span className="text-emerald-700 font-bold">Trần Minh Đức</span>
                  <span className="text-[9px] text-emerald-600 font-mono">(Đã duyệt)</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Chưa duyệt</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">BỘ PHẬN KIỂM SOÁT NỘI BỘ</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Người kiểm tra độc lập</p>
            <div className="h-12 flex items-end justify-center font-serif text-slate-800 font-bold italic">
              Phan Thanh Hải
            </div>
          </div>
        </div>

        {/* Compulsory Simulation Disclaimer */}
        <div className="p-3 rounded bg-slate-100 border border-slate-200 text-xs text-slate-600 text-center">
          Nguyên mẫu mô phỏng dữ liệu minh họa. Không dùng cho báo cáo chính thức hoặc tuyên bố Trung hòa carbon / Net Zero.
        </div>
      </div>
    </div>
  );
};
