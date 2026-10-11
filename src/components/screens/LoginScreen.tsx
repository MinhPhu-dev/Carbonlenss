import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { MOCK_USERS, MockUserAccount } from '../../types';
import { UserCheck, ShieldCheck, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useCarbon();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleEnterSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    const account = MOCK_USERS.find((u) => u.id === selectedUserId);
    if (account) {
      login(account);
    }
  };

  const getRoleIcon = (role: MockUserAccount['role']) => {
    switch (role) {
      case 'data_entry':
        return <UserCheck className="w-5 h-5 text-[#2E7D5B]" />;
      case 'approver':
        return <ShieldCheck className="w-5 h-5 text-[#0B2D45]" />;
      case 'auditor':
        return <Eye className="w-5 h-5 text-blue-700" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7F8] text-[#1F2937]">
      {/* Centered Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-md p-6 sm:p-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-[#2E7D5B] flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-xs shrink-0">
              CL
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#0B2D45]">CarbonLens</span>
              <p className="text-xs text-slate-500">Quản lý phát thải & Hồ sơ carbon truy xuất</p>
            </div>
          </div>

          {/* Heading */}
          <div className="border-t border-slate-100 pt-5 mb-5">
            <h1 className="text-lg font-bold text-[#0B2D45]">Đăng nhập</h1>
            <p className="text-xs text-slate-500 mt-0.5">Chọn tài khoản để dùng thử</p>
          </div>

          {/* Account Selection Form */}
          <form onSubmit={handleEnterSystem} className="space-y-4">
            <div className="space-y-2.5">
              {MOCK_USERS.map((account) => {
                const isSelected = selectedUserId === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => setSelectedUserId(account.id)}
                    className={`p-3.5 rounded-md border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-[#2E7D5B] bg-emerald-50/50 shadow-xs ring-1 ring-[#2E7D5B]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="p-2 rounded bg-slate-100 shrink-0 mt-0.5">
                      {getRoleIcon(account.role)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {account.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-[#0B2D45] mt-0.5">
                        {account.roleLabel}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {account.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedUserId}
              className={`w-full py-2.5 px-4 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors ${
                selectedUserId
                  ? 'bg-[#2E7D5B] hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <span>Vào hệ thống</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Simulated Login Notice */}
            <p className="text-center text-[11px] text-slate-400 pt-2">
              Đăng nhập mô phỏng — không sử dụng tài khoản thật
            </p>
          </form>
        </div>
      </div>

      {/* Mandatory Single Footer Disclaimer */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-6 text-center text-xs text-slate-500 no-print shrink-0">
        Nguyên mẫu mô phỏng dữ liệu minh họa. Không dùng cho báo cáo chính thức hoặc tuyên bố Trung hòa carbon / Net Zero.
      </footer>
    </div>
  );
};
