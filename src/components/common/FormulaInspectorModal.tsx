import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { X, Calculator, BookOpen, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Fuel, Zap } from 'lucide-react';

export const FormulaInspectorModal: React.FC = () => {
  const {
    selectedFormulaForInspection,
    setSelectedFormulaForInspection,
    emissionFactors,
    dieselParams,
    activeYear,
  } = useCarbon();

  if (!selectedFormulaForInspection) return null;

  const { category, year, record } = selectedFormulaForInspection;
  const isElec = category === 'electricity';

  const factor = emissionFactors.find((f) => f.category === 'electricity' && f.dataYear === year) ||
    emissionFactors.find((f) => f.category === 'electricity') ||
    emissionFactors[0];

  const val = record ? record.value : isElec ? 10000 : 4500;

  // Exact arithmetic calculations
  let elecMWh = 0;
  let elecTCO2 = 0;

  let doCO2 = 0;
  let doCH4 = 0;
  let doN2O = 0;
  let doTotalTCO2e = 0;

  if (isElec) {
    elecMWh = val / 1000;
    elecTCO2 = elecMWh * factor.value;
  } else {
    doCO2 = val * dieselParams.density * dieselParams.ncv * dieselParams.efCO2 * 1e-9;
    doCH4 = val * dieselParams.density * dieselParams.ncv * dieselParams.efCH4 * 1e-9 * dieselParams.gwpCH4;
    doN2O = val * dieselParams.density * dieselParams.ncv * dieselParams.efN2O * 1e-9 * dieselParams.gwpN2O;
    doTotalTCO2e = doCO2 + doCH4 + doN2O;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B2D45] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2E7D5B] rounded text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Chi tiết công thức & tính toán ({isElec ? 'Điện lưới (Scope 2)' : 'Dầu DO (Scope 1)'})
              </h3>
              <p className="text-xs text-slate-300">
                {record
                  ? `${record.categoryLabel || record.categoryName} Tháng ${record.month.toString().padStart(2, '0')}/${record.year}`
                  : `Phương pháp tính năm ${year}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFormulaForInspection(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
          {/* Step 1: Formula Display */}
          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Công thức tính toán
              </span>
              <span className="text-[11px] text-[#2E7D5B] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isElec ? 'Cục Biến đổi khí hậu' : 'IPCC 2006 Vol 2 Bảng 2.3'}
              </span>
            </div>

            {isElec ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-sm rounded border border-slate-800 text-center tracking-wide font-bold">
                  E_điện (tCO2) = [ Q_điện (kWh) / 1.000 ] × EF (tCO2/MWh)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trong đó: <span className="font-mono font-bold">Q_điện</span> là điện năng tiêu thụ tính bằng kWh; chia cho 1.000 để đổi sang MWh; sau đó nhân với hệ số phát thải <span className="font-mono font-bold">EF</span> tính bằng tCO2/MWh.
                </p>
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Lưu ý về đơn vị:</strong> Đơn vị được Cục Biến đổi khí hậu công bố trong tài liệu nguồn là <strong>tCO2</strong>. CarbonLens giữ nguyên đơn vị tCO2 của nguồn, không tự ý đổi thành tCO2e mà không giải trình.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded border border-slate-800 text-center tracking-wide font-bold">
                  E_CO2 (tCO2) = V_DO (lít) × ρ (kg/l) × NCV (TJ/Gg) × EF_CO2 (kg/TJ) × 10^-9
                </div>
                <div className="p-2 bg-slate-800 text-emerald-200 font-mono text-[11px] rounded border border-slate-700 text-center">
                  E_CH4 = V_DO × ρ × NCV × 3,0 × 10^-9 × 28 (GWP) | E_N2O = V_DO × ρ × NCV × 0,6 × 10^-9 × 265 (GWP)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ số IPCC cho dầu diesel trong đốt cố định của ngành cơ khí chế tạo được quy định tại <strong>Bảng 2.3 (Công nghiệp chế tạo và xây dựng)</strong> theo năng lượng (74.100 kg CO2/TJ, 3,0 kg CH4/TJ, 0,6 kg N2O/TJ). Công thức áp dụng chuỗi chuyển đổi chuẩn: thể tích (lít) → khối lượng (kg) → năng lượng (TJ) → phát thải (tCO2).
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Emission Factor & Source Reference */}
          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Hệ số phát thải & Nguồn đối chiếu
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                {isElec ? factor.statusLabel : dieselParams.isConfirmedByAdvisor ? 'Đã xác nhận' : 'Hệ số mặc định Tier 1'}
              </span>
            </div>

            {isElec ? (
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Năm dữ liệu:</span>
                  <span className="font-bold text-slate-900 font-mono">{factor.dataYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số văn bản:</span>
                  <span className="font-mono font-bold text-slate-900">{factor.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày ban hành văn bản:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {factor.documentDate === '2024-12-03' ? '03 tháng 12 năm 2024 (2024-12-03)' : factor.documentDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phiên bản bản ghi nội bộ:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{factor.internalVersion}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Giá trị hệ số (EF):</span>
                  <span className="font-mono font-bold text-sm text-[#0B2D45]">
                    {factor.value.toString().replace('.', ',')} {factor.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cơ quan thẩm quyền:</span>
                  <span className="font-semibold text-slate-800">{factor.legalSource}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Văn bản nguồn căn cứ:</span>
                  <span className="font-bold text-slate-900">{factor.documentReference}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Khối lượng riêng ρ:</span>
                  <span className="font-mono font-bold text-slate-900">{dieselParams.density} kg/lít (Tham khảo thương mại thông dụng VN)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nhiệt trị thuần NCV:</span>
                  <span className="font-mono font-bold text-slate-900">{dieselParams.ncv} TJ/Gg (IPCC 2006 Mặc định Bảng 1.2: 43,0 GJ/tấn)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hệ số EF_CO2:</span>
                  <span className="font-mono font-bold text-slate-900">{dieselParams.efCO2.toLocaleString('vi-VN')} kg CO2/TJ (IPCC 2006 Bảng 2.3 Công nghiệp chế tạo và xây dựng)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bộ GWP sử dụng:</span>
                  <span className="font-mono text-slate-700">IPCC AR5 (CH4: 28, N2O: 265)</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Phương pháp luận & Bảng IPCC:</span>
                  <span className="font-semibold text-slate-800">
                    Hướng dẫn IPCC 2006 (Khối lượng 2: Năng lượng, Bảng 1.2 cho NCV và Bảng 2.3 cho Công nghiệp chế tạo và xây dựng, áp dụng cho cơ sở cơ khí). Phân biệt Tier 1 (hệ số mặc định) và Tier 2/3 (thông số thử nghiệm riêng).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Exact Arithmetic Step-by-Step */}
          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Đối soát số học từng bước
            </span>

            {isElec ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Dữ liệu đầu vào:</span>
                  <span className="font-bold text-slate-900">{val.toLocaleString('vi-VN')} kWh</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Đổi đơn vị sang MWh:</span>
                  <span className="font-bold text-slate-900">{val.toLocaleString('vi-VN')} / 1.000 = {elecMWh.toLocaleString('vi-VN')} MWh</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Nhân hệ số EF năm 2023:</span>
                  <span className="font-bold text-slate-900">{elecMWh.toLocaleString('vi-VN')} × {factor.value.toString().replace('.', ',')} tCO2/MWh</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-[#0B2D45]">Kết quả phát thải điện:</span>
                  <span className="text-[#2E7D5B] text-base">
                    {elecTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Căn cứ: Công văn 1726/BĐKH-PTCBT ngày 03 tháng 12 năm 2024
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Thể tích dầu DO đầu vào (V):</span>
                  <span className="font-bold text-slate-900">{val.toLocaleString('vi-VN')} lít</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CO2 = {val.toLocaleString('vi-VN')} × {dieselParams.density} × {dieselParams.ncv} × 74.100 × 10^-9:</span>
                  <span className="font-bold text-slate-900">{doCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CH4 (quy đổi CO2e bằng GWP 28):</span>
                  <span className="font-bold text-slate-900">{doCH4.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>N2O (quy đổi CO2e bằng GWP 265):</span>
                  <span className="font-bold text-slate-900">{doN2O.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-[#0B2D45]">Tổng phát thải Scope 1:</span>
                  <span className="text-[#C67C1A] text-base">
                    {doTotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedFormulaForInspection(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
