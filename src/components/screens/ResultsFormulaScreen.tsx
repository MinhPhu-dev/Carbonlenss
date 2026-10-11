import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import {
  Calculator,
  BookOpen,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Fuel,
  CheckCircle2,
  Settings,
  Edit3,
  Sliders,
  Check,
} from 'lucide-react';

export const ResultsFormulaScreen: React.FC = () => {
  const {
    activeYear,
    activityRecords,
    emissionFactors,
    dieselParams,
    scope1CO2Ton,
    scope1CH4TonCO2e,
    scope1N2OTonCO2e,
    scope1TotalTCO2e,
    scope2TotalTCO2,
    grossEmissionsTCO2e,
    setSelectedFormulaForInspection,
    updateDieselParams,
    confirmDieselParameters,
    role,
  } = useCarbon();

  // Test sandbox calculator for evaluating 10,000 kWh -> 6.592 tCO2
  const [testKWh, setTestKWh] = useState<number>(10000);

  // Modal / drawer to configure and confirm diesel parameters
  const [isDieselConfigOpen, setIsDieselConfigOpen] = useState(false);
  const [inputDensity, setInputDensity] = useState(dieselParams.density.toString());
  const [inputNCV, setInputNCV] = useState(dieselParams.ncv.toString());
  const [advisorName, setAdvisorName] = useState('Viện Khoa học & Công nghệ Môi trường (Cố vấn)');
  const [confirmNotes, setConfirmNotes] = useState('Đã đối chiếu phiếu thử nghiệm xăng dầu Petrolimex số 8892/PTN');

  const yearRecords = activityRecords.filter((r) => r.year === activeYear);
  const elecRecords = yearRecords.filter((r) => r.category === 'electricity');
  const doRecords = yearRecords.filter((r) => r.category === 'diesel');

  const currentElecFactor =
    emissionFactors.find((f) => f.category === 'electricity' && f.dataYear === activeYear) ||
    emissionFactors.find((f) => f.category === 'electricity')!;

  // Sandbox calculation
  const sandboxMWh = testKWh / 1000;
  const sandboxTCO2 = sandboxMWh * currentElecFactor.value;

  const handleSaveDieselConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const rho = parseFloat(inputDensity);
    const ncv = parseFloat(inputNCV);
    if (isNaN(rho) || rho <= 0 || isNaN(ncv) || ncv <= 0) {
      alert('Vui lòng nhập giá trị khối lượng riêng và nhiệt trị hợp lệ.');
      return;
    }
    updateDieselParams(
      { density: rho, ncv: ncv },
      `Cập nhật khối lượng riêng rho=${rho} kg/l, NCV=${ncv} TJ/Gg theo phiếu thử nghiệm`
    );
    setIsDieselConfigOpen(false);
  };

  const handleConfirmByAdvisor = () => {
    if (role !== 'approver') {
      alert('Từ chối: Chỉ người dùng ở vai trò "Người duyệt" mới có thẩm quyền xác nhận thông số dầu DO.');
      return;
    }
    confirmDieselParameters(advisorName, confirmNotes);
    setIsDieselConfigOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B2D45] tracking-tight">Kết quả phát thải & Công thức</h1>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              Năm {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp phát thải Phạm vi 1, Phạm vi 2 và đối soát các bước tính theo hệ số nguồn.
          </p>
        </div>
      </div>

      {/* KPI Emissions Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scope 1 */}
        <div
          onClick={() =>
            setSelectedFormulaForInspection({
              category: 'diesel',
              year: activeYear,
            })
          }
          className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs hover:border-[#2E7D5B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Phạm vi 1 (Scope 1)
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 border ${
              dieselParams.isConfirmedByAdvisor
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <Fuel className="w-3 h-3 text-[#C67C1A]" />
              {dieselParams.isConfirmedByAdvisor ? 'Thông số đã xác nhận' : 'Chưa xác nhận — không dùng cho báo cáo đã duyệt'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0B2D45] tabular-nums">
              {scope1TotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </span>
            <span className="text-xs font-semibold text-slate-500">tCO2e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Đốt dầu DO (IPCC 2006: CO2, CH4, N2O)</span>
            <span className="text-[#2E7D5B] font-semibold group-hover:underline flex items-center gap-0.5">
              Xem công thức IPCC <Info className="w-3 h-3 inline" />
            </span>
          </p>
        </div>

        {/* Scope 2 */}
        <div
          onClick={() =>
            setSelectedFormulaForInspection({
              category: 'electricity',
              year: activeYear,
            })
          }
          className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs hover:border-[#2E7D5B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Phạm vi 2 (Scope 2)
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#2E7D5B]" /> CV 1726/BĐKH-PTCBT
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0B2D45] tabular-nums">
              {scope2TotalTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </span>
            <span className="text-xs font-semibold text-slate-500">tCO2 (Đơn vị tài liệu nguồn)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Hệ số lưới: {currentElecFactor.value.toString().replace('.', ',')} tCO2/MWh</span>
            <span className="text-[#2E7D5B] font-semibold group-hover:underline flex items-center gap-0.5">
              Xem công thức <Info className="w-3 h-3 inline" />
            </span>
          </p>
        </div>

        {/* Total Gross */}
        <div className="bg-[#0B2D45] text-white p-4 rounded-md border border-[#0B2D45] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Tổng phát thải (Gross)
            </span>
            <span className="text-[11px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded font-mono">
              Scope 1 + Scope 2
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
              {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </span>
            <span className="text-xs font-semibold text-slate-300">tCO2e</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Điện lưới & Dầu DO · Không trừ tín chỉ
          </p>
        </div>
      </div>

      {/* Interactive Verification Sandbox */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#2E7D5B]" />
            <h2 className="text-sm font-bold text-[#0B2D45]">
              Tính thử nghiệm điện lưới (Hệ số: {currentElecFactor.value.toString().replace('.', ',')} tCO2/MWh)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
            Công văn 1726/BĐKH-PTCBT ngày 03 tháng 12 năm 2024
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded border border-slate-800 text-center font-bold">
              E_điện = [ Q_điện (kWh) / 1.000 ] × EF (tCO2/MWh)
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-600 font-semibold shrink-0">Nhập số kWh kiểm thử:</label>
              <input
                type="number"
                value={testKWh}
                onChange={(e) => setTestKWh(Number(e.target.value) || 0)}
                className="w-36 p-1.5 border border-slate-300 rounded font-mono font-bold text-xs"
              />
              <button
                onClick={() => setTestKWh(10000)}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium"
              >
                Gán 10.000 kWh
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Giữ nguyên đơn vị tài liệu nguồn sử dụng là <strong>tCO2</strong> theo công bố chính thức của Cục Biến đổi khí hậu (ngày 03 tháng 12 năm 2024).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Đầu vào:</span>
              <span className="font-bold text-slate-900">{testKWh.toLocaleString('vi-VN')} kWh</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Đổi đơn vị:</span>
              <span className="font-bold text-slate-900">{testKWh.toLocaleString('vi-VN')} / 1.000 = {sandboxMWh.toLocaleString('vi-VN')} MWh</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hệ số:</span>
              <span className="font-bold text-slate-900">{currentElecFactor.value.toString().replace('.', ',')} tCO2/MWh</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phép nhân:</span>
              <span className="font-bold text-slate-900">{sandboxMWh.toLocaleString('vi-VN')} × {currentElecFactor.value.toString().replace('.', ',')}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center text-sm">
              <span className="font-bold text-[#0B2D45]">Kết quả:</span>
              <span className="font-bold text-[#2E7D5B] text-base">
                {sandboxTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              Nguồn: Công văn 1726/BĐKH-PTCBT ngày 03 tháng 12 năm 2024
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#0B2D45] uppercase tracking-wide">
            Chi tiết phát thải theo từng tháng (Bấm vào dòng để xem đối soát số học)
          </h2>
          <span className="text-[11px] text-slate-500 italic">
            Điện lưới tính theo tCO2 · Dầu DO tính theo chuỗi năng lượng IPCC 2006
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tháng</th>
                <th className="py-2.5 px-3 text-right">Điện lưới (kWh)</th>
                <th className="py-2.5 px-3 text-right">Phát thải Scope 2 (tCO2)</th>
                <th className="py-2.5 px-3 text-right">Dầu DO (lít)</th>
                <th className="py-2.5 px-3 text-right">Phát thải Scope 1 (tCO2e)</th>
                <th className="py-2.5 px-3 text-right">Tổng tháng (tCO2e)</th>
                <th className="py-2.5 px-3 text-center">Giải trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const elec = elecRecords.find((r) => r.month === m);
                const doRec = doRecords.find((r) => r.month === m);

                const elecKWh = elec ? elec.value : 0;
                const elecTCO2 = (elecKWh / 1000) * currentElecFactor.value;

                const doLiters = doRec ? doRec.value : 0;
                const doCO2 = doLiters * dieselParams.density * dieselParams.ncv * dieselParams.efCO2 * 1e-9;
                const doCH4 = doLiters * dieselParams.density * dieselParams.ncv * dieselParams.efCH4 * 1e-9 * dieselParams.gwpCH4;
                const doN2O = doLiters * dieselParams.density * dieselParams.ncv * dieselParams.efN2O * 1e-9 * dieselParams.gwpN2O;
                const doTotalTCO2e = doCO2 + doCH4 + doN2O;

                const monthTotal = elecTCO2 + doTotalTCO2e;

                return (
                  <tr
                    key={m}
                    onClick={() => {
                      if (elec) {
                        setSelectedFormulaForInspection({
                          category: 'electricity',
                          year: activeYear,
                          record: elec,
                        });
                      } else if (doRec) {
                        setSelectedFormulaForInspection({
                          category: 'diesel',
                          year: activeYear,
                          record: doRec,
                        });
                      }
                    }}
                    className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                      !elec ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                      Tháng {m.toString().padStart(2, '0')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {elec ? (
                        elec.value.toLocaleString('vi-VN')
                      ) : (
                        <span className="text-red-600 font-bold italic">Thiếu tháng 7</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#2E7D5B] tabular-nums">
                      {elec ? elecTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '0,000'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {doRec ? doRec.value.toLocaleString('vi-VN') : '0'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#C67C1A] tabular-nums">
                      {doTotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {monthTotal.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFormulaForInspection({
                            category: elec ? 'electricity' : 'diesel',
                            year: activeYear,
                            record: elec || doRec,
                          });
                        }}
                        className="text-[11px] text-[#2E7D5B] hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2.5 px-3">Cả năm {activeYear}</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {elecRecords.reduce((sum, r) => sum + r.value, 0).toLocaleString('vi-VN')} kWh
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#2E7D5B] tabular-nums">
                  {scope2TotalTCO2.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {doRecords.reduce((sum, r) => sum + r.value, 0).toLocaleString('vi-VN')} lít
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#C67C1A] tabular-nums">
                  {scope1TotalTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-base text-[#0B2D45] tabular-nums">
                  {grossEmissionsTCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tCO2e
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Versioned Emission Factors Library */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-[#0B2D45] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2E7D5B]" />
            <span>Thư viện hệ số phát thải</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Các hệ số áp dụng theo văn bản công bố của Cục Biến đổi khí hậu và tài liệu tham khảo.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Danh mục</th>
                <th className="p-2.5">Năm dữ liệu</th>
                <th className="p-2.5">Số văn bản</th>
                <th className="p-2.5">Ngày ban hành</th>
                <th className="p-2.5">Phiên bản bản ghi nội bộ</th>
                <th className="p-2.5 text-right">Giá trị (EF)</th>
                <th className="p-2.5">Đơn vị</th>
                <th className="p-2.5">Trạng thái</th>
                <th className="p-2.5">Tài liệu nguồn trích dẫn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emissionFactors.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-semibold text-slate-800">{f.categoryName}</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">{f.dataYear}</td>
                  <td className="p-2.5 font-mono text-slate-700 font-semibold">
                    {f.documentNumber === 'Chưa xác minh' ? (
                      <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                        Chưa xác minh
                      </span>
                    ) : (
                      f.documentNumber
                    )}
                  </td>
                  <td className="p-2.5 font-mono text-slate-800 font-semibold">
                    {f.documentDate === '2024-12-03' ? (
                      <div>
                        <span>03 tháng 12 năm 2024</span>
                        <span className="block text-[10px] text-slate-400 font-normal">2024-12-03</span>
                      </div>
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                        Chưa xác minh
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-mono text-slate-600 text-[11px]">{f.internalVersion}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                    {f.value.toString().replace('.', ',')}
                  </td>
                  <td className="p-2.5 font-medium text-slate-600">{f.unit}</td>
                  <td className="p-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        f.dataYear === 2023
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : f.status === 'official'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {f.dataYear === 2023 ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {f.statusLabel}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate" title={f.documentReference}>
                      {f.documentReference}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={f.legalSource}>
                      {f.legalSource}
                    </div>
                    {f.configNotes && (
                      <div className="text-[10px] text-[#C67C1A] mt-0.5">{f.configNotes}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dầu DO IPCC 2006 Parameters Configuration Card */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0B2D45] flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#C67C1A]" />
              <span>Chuỗi chuyển đổi năng lượng & Hệ số dầu DO (IPCC 2006 Vol 2 Bảng 2.3 Công nghiệp chế tạo & xây dựng)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Công thức: E_CO2 = V_DO (lít) × ρ (kg/lít) × NCV (TJ/Gg) × EF_CO2 (kg/TJ) × 10^-9 (tCO2). Tính riêng CH4 (GWP 28) và N2O (GWP 265).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${
              dieselParams.isConfirmedByAdvisor
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              {dieselParams.isConfirmedByAdvisor
                ? 'Thông số riêng có bằng chứng — đã xác nhận'
                : 'Hệ số mặc định có nguồn — kết quả ước tính (Tier 1)'}
            </span>

            <button
              onClick={() => setIsDieselConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-[#0B2D45] text-white hover:bg-[#153e5e]"
            >
              <Sliders className="w-3 h-3" />
              <span>Cấu hình & Phê chuẩn nội bộ DO</span>
            </button>
          </div>
        </div>

        {/* Detailed IPCC Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Khối lượng riêng (ρ):</span>
            <span className="font-mono font-bold text-sm text-slate-800">{dieselParams.density} kg/lít</span>
            <span className="text-[10px] text-slate-400 block mt-1">Tham khảo thương mại dầu DO thông dụng tại VN</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Nhiệt trị thuần (NCV):</span>
            <span className="font-mono font-bold text-sm text-slate-800">{dieselParams.ncv} TJ/Gg</span>
            <span className="text-[10px] text-slate-400 block mt-1">IPCC 2006 Vol 2 Bảng 1.2 Mặc định (43,0 GJ/tấn)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Hệ số CO2 (EF_CO2):</span>
            <span className="font-mono font-bold text-sm text-slate-800">{dieselParams.efCO2.toLocaleString('vi-VN')} kg CO2/TJ</span>
            <span className="text-[10px] text-slate-400 block mt-1">IPCC 2006 Vol 2 Bảng 2.3 Công nghiệp chế tạo</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Khí CH4 & N2O (GWP AR5):</span>
            <span className="font-mono font-bold text-sm text-slate-800">CH4: 28 · N2O: 265</span>
            <span className="text-[10px] text-slate-400 block mt-1">3 kg CH4/TJ & 0.6 kg N2O/TJ (Bảng 2.3)</span>
          </div>
        </div>

        {dieselParams.isConfirmedByAdvisor && (
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Đã xác nhận thông số bởi: </span>
              <span>{dieselParams.advisorName} ({new Date(dieselParams.confirmationDate || '').toLocaleDateString('vi-VN')})</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">{dieselParams.confirmationNotes}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
        )}
      </div>

      {/* Diesel Configuration & Confirmation Modal */}
      {isDieselConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0B2D45] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Cấu hình thông số dầu DO</h3>
              <button onClick={() => setIsDieselConfigOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                Để đủ điều kiện phê duyệt kỳ kiểm kê, cần xác nhận khối lượng riêng và nhiệt trị dầu DO kèm căn cứ đối soát.
              </div>

              <form onSubmit={handleSaveDieselConfig} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Khối lượng riêng ρ (kg/lít)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={inputDensity}
                      onChange={(e) => setInputDensity(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nhiệt trị NCV (TJ/Gg = GJ/tấn)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputNCV}
                      onChange={(e) => setInputNCV(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-800">
                    Lưu thông số
                  </button>
                </div>
              </form>

              {/* Confirmation area for approver */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-bold text-[#0B2D45] block">Xác nhận thông số (Dành cho Người duyệt):</span>
                <div>
                  <label className="text-slate-600 block mb-0.5">Tên cố vấn / Đơn vị kiểm định:</label>
                  <input
                    type="text"
                    value={advisorName}
                    onChange={(e) => setAdvisorName(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-0.5">Căn cứ xác nhận (Số phiếu thử nghiệm, chứng thư):</label>
                  <input
                    type="text"
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDieselConfigOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmByAdvisor}
                    className="px-4 py-1.5 bg-[#2E7D5B] hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác nhận thông số (Mở khóa duyệt)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
