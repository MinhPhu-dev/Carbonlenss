import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { ActivityRecord } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Zap,
  Fuel,
  Info,
} from 'lucide-react';

export const ActivityDataScreen: React.FC = () => {
  const {
    activityRecords,
    activeYear,
    role,
    addRecord,
    updateRecord,
    deleteRecord,
    setSelectedRecordForDoc,
    setSelectedFormulaForInspection,
  } = useCarbon();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'electricity' | 'diesel'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);

  // Form states for adding/editing record
  const [formCategory, setFormCategory] = useState<'electricity' | 'diesel'>('electricity');
  const [formMonth, setFormMonth] = useState<number>(1);
  const [formValue, setFormValue] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('kWh');
  const [formInvoice, setFormInvoice] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formReason, setFormReason] = useState<string>('');

  const yearRecords = activityRecords.filter((r) => r.year === activeYear);

  const filteredRecords = yearRecords.filter((r) => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch =
      r.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.enteredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.attachmentName && r.attachmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Sort by category then month
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'electricity' ? -1 : 1;
    }
    return a.month - b.month;
  });

  const totalElecKWh = yearRecords
    .filter((r) => r.category === 'electricity')
    .reduce((sum, r) => sum + r.value, 0);

  const totalDOLiters = yearRecords
    .filter((r) => r.category === 'diesel')
    .reduce((sum, r) => sum + r.value, 0);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormCategory('electricity');
    setFormMonth(1);
    setFormValue('');
    setFormUnit('kWh');
    setFormInvoice(`HDDT-${activeYear}-EVN-0${Math.floor(1000 + Math.random() * 9000)}`);
    setFormAttachmentName(`EVN_HoaDon_T01_${activeYear}.pdf`);
    setFormNotes('');
    setFormReason('Nhập số liệu định kỳ theo hóa đơn hàng tháng');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (rec: ActivityRecord) => {
    setEditingRecord(rec);
    setFormCategory(rec.category);
    setFormMonth(rec.month);
    setFormValue(rec.value.toString());
    setFormUnit(rec.unit);
    setFormInvoice(rec.invoiceNumber);
    setFormAttachmentName(rec.attachmentName || '');
    setFormNotes(rec.notes || '');
    setFormReason('Điều chỉnh số liệu đối soát kế toán');
    setIsAddModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(formValue);
    if (isNaN(valNum) || valNum <= 0) {
      alert('Vui lòng nhập số liệu hoạt động hợp lệ lớn hơn 0.');
      return;
    }

    if (editingRecord) {
      updateRecord(
        editingRecord.id,
        {
          month: formMonth,
          value: valNum,
          unit: formUnit,
          invoiceNumber: formInvoice.trim(),
          hasAttachment: Boolean(formAttachmentName.trim()),
          attachmentName: formAttachmentName.trim(),
          notes: formNotes.trim(),
        },
        formReason || 'Cập nhật dòng dữ liệu hoạt động'
      );
    } else {
      addRecord(
        {
          year: activeYear,
          month: formMonth,
          category: formCategory,
          categoryLabel: formCategory === 'electricity' ? 'Điện lưới (Phạm vi 2)' : 'Dầu DO máy phát & lò hơi (Phạm vi 1)',
          value: valNum,
          unit: formUnit,
          invoiceNumber: formInvoice.trim(),
          enteredBy: 'Nguyễn Văn An',
          enteredRole: 'Cán bộ Môi trường',
          hasAttachment: Boolean(formAttachmentName.trim()),
          attachmentName: formAttachmentName.trim(),
          notes: formNotes.trim(),
          attachmentMeta: {
            issuer: formCategory === 'electricity' ? 'Công ty Điện lực Bắc Ninh - Điện lực Quế Võ' : 'Công ty Xăng dầu Petrolimex Bắc Ninh',
            issueDate: `${activeYear}-${formMonth.toString().padStart(2, '0')}-05`,
            taxCode: formCategory === 'electricity' ? '2300123456' : '2300234567',
            hashValidation: `SHA256:${Math.random().toString(36).substr(2, 6)}...${Math.random().toString(36).substr(2, 4)}`,
          },
        },
        formReason || 'Thêm mới dòng dữ liệu hoạt động'
      );
    }

    setIsAddModalOpen(false);
  };

  // CSV export handler
  const handleExportCSV = () => {
    const headers = ['Năm', 'Tháng', 'Phân loại', 'Số lượng', 'Đơn vị', 'Số hóa đơn', 'Người nhập', 'Tệp đính kèm', 'Ghi chú'];
    const rows = yearRecords.map((r) => [
      r.year,
      r.month,
      r.categoryLabel,
      r.value,
      r.unit,
      `"${r.invoiceNumber}"`,
      `"${r.enteredBy}"`,
      `"${r.attachmentName || ''}"`,
      `"${r.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarbonLens_DuLieuHoatDong_${activeYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV upload handler
  const handleSimulatedCSVUpload = () => {
    alert('Định dạng tệp CSV hợp lệ: Năm, Tháng, Phân loại (electricity/diesel), Số lượng, Đơn vị (kWh/lít), Số hóa đơn, Tệp đính kèm.');
  };

  const isReadOnly = role === 'auditor';

  return (
    <div className="space-y-6">
      {/* Top Title & KPI strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B2D45] tracking-tight">Dữ liệu hoạt động</h1>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              Năm {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng theo dõi điện lưới và dầu DO kèm số hóa đơn, tệp đính kèm và người nhập.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-2xs transition-colors"
            title="Tải bảng tính dữ liệu CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất CSV</span>
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={handleSimulatedCSVUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-2xs transition-colors"
                title="Tải tệp bảng tính CSV vào hệ thống"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Nạp CSV</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2E7D5B] hover:bg-emerald-700 rounded shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dòng dữ liệu</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Tổng điện lưới (Phạm vi 2)</span>
            <span className="text-xl font-bold font-mono text-[#0B2D45] tabular-nums">
              {totalElecKWh.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kWh</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Tương đương {(totalElecKWh / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MWh
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded text-[#2E7D5B]">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Tổng dầu DO (Phạm vi 1)</span>
            <span className="text-xl font-bold font-mono text-[#0B2D45] tabular-nums">
              {totalDOLiters.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">lít</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Đốt cố định máy phát & lò hơi sấy sơn
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded text-[#C67C1A]">
            <Fuel className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Tỷ lệ chứng từ đính kèm</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-[#2E7D5B] tabular-nums">
                {Math.round((yearRecords.filter((r) => r.hasAttachment).length / (yearRecords.length || 1)) * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({yearRecords.filter((r) => r.hasAttachment).length}/{yearRecords.length} dòng)
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              Có chữ ký số và đối soát kế toán
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded text-blue-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#0B2D45] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả nguồn ({yearRecords.length})
            </button>
            <button
              onClick={() => setCategoryFilter('electricity')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                categoryFilter === 'electricity'
                  ? 'bg-white text-[#0B2D45] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Điện lưới ({yearRecords.filter((r) => r.category === 'electricity').length})
            </button>
            <button
              onClick={() => setCategoryFilter('diesel')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                categoryFilter === 'diesel'
                  ? 'bg-white text-[#0B2D45] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dầu DO ({yearRecords.filter((r) => r.category === 'diesel').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm số hóa đơn, người nhập..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded focus:border-[#2E7D5B] focus:outline-none"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tháng</th>
                <th className="py-2.5 px-3">Nguồn tiêu thụ</th>
                <th className="py-2.5 px-3 text-right">Số lượng hoạt động</th>
                <th className="py-2.5 px-3">Đơn vị</th>
                <th className="py-2.5 px-3">Số chứng từ (Hóa đơn)</th>
                <th className="py-2.5 px-3">Chứng từ đính kèm</th>
                <th className="py-2.5 px-3">Người nhập</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chưa có dòng dữ liệu nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r) => {
                  const isElec = r.category === 'electricity';
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        r.isFlaggedAnomaly ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Month */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                        Tháng {r.month.toString().padStart(2, '0')}
                      </td>

                      {/* Source */}
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {isElec ? (
                            <Zap className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />
                          ) : (
                            <Fuel className="w-3.5 h-3.5 text-[#C67C1A] shrink-0" />
                          )}
                          <span className="truncate max-w-[140px]">{r.categoryLabel}</span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {r.value.toLocaleString('vi-VN')}
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-3 font-medium text-slate-600">{r.unit}</td>

                      {/* Invoice number */}
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => setSelectedRecordForDoc(r)}
                          className="font-mono text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 text-[11px]"
                          title="Bấm để xem chứng từ điện tử gốc"
                        >
                          <span>{r.invoiceNumber}</span>
                          <Eye className="w-3 h-3 text-blue-500" />
                        </button>
                      </td>

                      {/* Attachment file */}
                      <td className="py-2.5 px-3">
                        {r.hasAttachment ? (
                          <button
                            onClick={() => setSelectedRecordForDoc(r)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono hover:bg-emerald-100 transition-colors max-w-[170px] truncate"
                            title={`Xem tệp: ${r.attachmentName}`}
                          >
                            <Paperclip className="w-3 h-3 shrink-0 text-emerald-600" />
                            <span className="truncate">{r.attachmentName}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-amber-700 italic flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Chưa đính kèm
                          </span>
                        )}
                      </td>

                      {/* Entered by */}
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        <div>{r.enteredBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(r.timestamp).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              setSelectedFormulaForInspection({
                                category: r.category,
                                year: r.year,
                                record: r,
                              })
                            }
                            className="p-1 text-slate-500 hover:text-[#2E7D5B] hover:bg-slate-100 rounded"
                            title="Xem công thức tính toán dòng này"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                                title="Chỉnh sửa dòng dữ liệu"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Nhập lý do xóa dòng dữ liệu này (để lưu nhật ký):', 'Xóa dòng do trùng số liệu');
                                  if (reason) {
                                    deleteRecord(r.id, reason);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0B2D45] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingRecord ? 'Chỉnh sửa dòng dữ liệu hoạt động' : 'Thêm mới dòng dữ liệu hoạt động'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại năng lượng / nguồn</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const c = e.target.value as 'electricity' | 'diesel';
                      setFormCategory(c);
                      setFormUnit(c === 'electricity' ? 'kWh' : 'lít');
                    }}
                    disabled={Boolean(editingRecord)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none"
                  >
                    <option value="electricity">Điện lưới (Phạm vi 2)</option>
                    <option value="diesel">Dầu DO máy phát & lò hơi (Phạm vi 1)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tháng kiểm kê (1 - 12)</label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none font-mono"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m.toString().padStart(2, '0')}/{activeYear}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số lượng tiêu thụ</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="VD: 179500"
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn vị đo lường</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none"
                  >
                    {formCategory === 'electricity' ? (
                      <>
                        <option value="kWh">kWh (Chuẩn hệ thống)</option>
                        <option value="MWh">MWh (Cảnh báo sai đơn vị)</option>
                      </>
                    ) : (
                      <>
                        <option value="lít">lít (Chuẩn hệ số)</option>
                        <option value="kg">kg (Cần quy đổi)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số hóa đơn / Số chứng từ gốc</label>
                <input
                  type="text"
                  required
                  value={formInvoice}
                  onChange={(e) => setFormInvoice(e.target.value)}
                  placeholder="VD: HDDT-2023-EVN-07894"
                  className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên file chứng từ đính kèm (Giả lập PDF)</label>
                <input
                  type="text"
                  value={formAttachmentName}
                  onChange={(e) => setFormAttachmentName(e.target.value)}
                  placeholder="VD: EVN_HoaDon_T07_2023_07894.pdf"
                  className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú đối soát nội bộ</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="VD: Đã kiểm tra chỉ số công tơ 3 giá với EVN"
                  className="w-full p-2 border border-slate-300 rounded focus:border-[#2E7D5B] outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                <label className="font-bold block mb-1">Lý do thay đổi (Bắt buộc ghi vào Nhật ký thay đổi):</label>
                <input
                  type="text"
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="VD: Bổ sung hóa đơn sau khi phòng kế toán trả bản quét"
                  className="w-full p-1.5 bg-white border border-amber-300 rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-100 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D5B] hover:bg-emerald-700 text-white rounded font-bold"
                >
                  Lưu & Ghi nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
