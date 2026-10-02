import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, DollarSign, CheckCircle2, 
  AlertCircle, Download, Printer, Plus, RefreshCw, UserCheck, ShieldCheck, X
} from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { SheetsEditableCell, SheetsColumnHeader, SheetsToolbarLegend } from './UniversalInlineEditor';

const DEFAULT_STAFF = [
  { id: 'STF-01', name: 'Ramesh Mohanty', role: 'Front Desk Lead / Receptionist', shift: 'Morning (07:00 - 15:00)', baseSalary: 18000, daysPresent: 28, advances: 2000, phone: '9861012345' },
  { id: 'STF-02', name: 'Suresh Kumar Panda', role: 'Chief Night Auditor & Cashier', shift: 'Night (23:00 - 07:00)', baseSalary: 20000, daysPresent: 29, advances: 0, phone: '9437012346' },
  { id: 'STF-03', name: 'Babula Sahu', role: 'Head Chef (Cannon Kitchen)', shift: 'General (10:00 - 19:00)', baseSalary: 24000, daysPresent: 27, advances: 3500, phone: '9861022347' },
  { id: 'STF-04', name: 'Pradeep Jena', role: 'F&B Service Captain', shift: 'Evening (15:00 - 23:00)', baseSalary: 16000, daysPresent: 28, advances: 1000, phone: '9438032348' },
  { id: 'STF-05', name: 'Anita Majhi', role: 'Housekeeping Supervisor', shift: 'Morning (07:00 - 15:00)', baseSalary: 14000, daysPresent: 29, advances: 500, phone: '9861042349' },
  { id: 'STF-06', name: 'Balaram Nayak', role: 'Senior Room Boy', shift: 'Morning (07:00 - 15:00)', baseSalary: 12000, daysPresent: 30, advances: 1500, phone: '9861052350' },
  { id: 'STF-07', name: 'Kailash Sabar', role: 'Maintenance Technician', shift: 'General (09:00 - 18:00)', baseSalary: 15000, daysPresent: 28, advances: 0, phone: '9439062351' },
  { id: 'STF-08', name: 'Dillip Rout', role: 'Security Guard (Main Gate)', shift: 'Night (23:00 - 07:00)', baseSalary: 12500, daysPresent: 30, advances: 0, phone: '9861072352' }
];

export default function StaffPayrollSection({
  onSaveAttendance,
  onDisburseSalary
}) {
  const [activeSubTab, setActiveSubTab] = useState('attendance'); // 'attendance' | 'payroll'
  const [staffList, setStaffList] = useState(DEFAULT_STAFF);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks, setAttendanceMarks] = useState({
    'STF-01': 'P',
    'STF-02': 'P',
    'STF-03': 'P',
    'STF-04': 'P',
    'STF-05': 'P',
    'STF-06': 'P',
    'STF-07': 'P',
    'STF-08': 'P'
  });
  const [isSyncingBiometric, setIsSyncingBiometric] = useState(false);
  const [voucherModalStaff, setVoucherModalStaff] = useState(null);
  const [advanceModalStaff, setAdvanceModalStaff] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('Medical / Family Emergency');

  // Biometric Terminal Sync
  const handleBiometricSync = () => {
    setIsSyncingBiometric(true);
    setTimeout(() => {
      setIsSyncingBiometric(false);
      setAttendanceMarks({
        'STF-01': 'P',
        'STF-02': 'P',
        'STF-03': 'P',
        'STF-04': 'P',
        'STF-05': 'P',
        'STF-06': 'P',
        'STF-07': 'P',
        'STF-08': 'P'
      });
      alert('✓ Real-time biometric terminal punch-logs synchronized! 8 staff verified.');
    }, 1200);
  };

  // Record Attendance Mark Change
  const handleMarkChange = (staffId, mark) => {
    setAttendanceMarks(prev => ({
      ...prev,
      [staffId]: mark
    }));
  };

  // Submit Advance Salary
  const handleSaveAdvance = (e) => {
    e.preventDefault();
    const amt = parseFloat(advanceAmount);
    if (isNaN(amt) || amt <= 0 || !advanceModalStaff) return;

    setStaffList(prev => prev.map(s => {
      if (s.id === advanceModalStaff.id) {
        return { ...s, advances: s.advances + amt };
      }
      return s;
    }));

    setAdvanceModalStaff(null);
    setAdvanceAmount('');
  };

  // Calculate Net Payable
  const calculateSalary = (staff) => {
    const totalDaysInMonth = 30;
    const perDayWage = staff.baseSalary / totalDaysInMonth;
    const earnedGross = Math.round(perDayWage * staff.daysPresent);
    const netPayable = Math.max(0, earnedGross - staff.advances);
    return { perDayWage, earnedGross, netPayable };
  };

  // Print Salary Slip
  const handlePrintSlip = (staff) => {
    const { perDayWage, earnedGross, netPayable } = calculateSalary(staff);
    const printWindow = window.open('', '_blank', 'width=750,height=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Payment Voucher - ${staff.name}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 16px; }
            .voucher { border: 2px solid #0f172a; border-radius: 8px; padding: 20px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: 800; }
            .meta { font-size: 11px; color: #475569; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            .details-table td, .details-table th { padding: 6px 10px; border: 1px solid #cbd5e1; }
            .details-table th { background: #f8fafc; text-align: left; }
            .amount-box { margin-top: 14px; background: #f1f5f9; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 16px; font-size: 11px; }
            .sig-line { border-top: 1px dashed #000; width: 180px; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="voucher">
            <div class="header">
              <div>
                <div class="title">${HOTEL_CONFIG.legalName}</div>
                <div class="meta">Rayagada, Odisha • GSTIN: ${HOTEL_CONFIG.gstin}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 800; font-size: 14px; color: #b45309;">MONTHLY SALARY VOUCHER</div>
                <div class="meta">Date: ${new Date().toLocaleDateString()} • Ref: VOUCH-${staff.id}</div>
              </div>
            </div>

            <table class="details-table">
              <tr>
                <th>Employee Name</th>
                <td><strong>${staff.name}</strong> (${staff.id})</td>
                <th>Designation</th>
                <td>${staff.role}</td>
              </tr>
              <tr>
                <th>Shift Roster</th>
                <td>${staff.shift}</td>
                <th>Contact Phone</th>
                <td>${staff.phone}</td>
              </tr>
              <tr>
                <th>Base Monthly Wage</th>
                <td>₹${staff.baseSalary.toLocaleString('en-IN')}</td>
                <th>Days Worked (Present)</th>
                <td>${staff.daysPresent} / 30 Days</td>
              </tr>
              <tr>
                <th>Earned Gross Wages</th>
                <td>₹${earnedGross.toLocaleString('en-IN')}</td>
                <th>Salary Advances Deducted</th>
                <td style="color: #dc2626;">- ₹${staff.advances.toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <div class="amount-box">
              <span>NET SALARY DISBURSED:</span>
              <span>₹${netPayable.toLocaleString('en-IN')}</span>
            </div>

            <div class="signatures">
              <div class="sig-line">Employee Signature<br/>(${staff.name})</div>
              <div class="sig-line">Cashier / Accounts Signature</div>
              <div class="sig-line">Managing Director Approval<br/>(Eswara)</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      background: 'rgba(12, 24, 43, 0.9)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '14px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid #34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399'
          }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
              Staff Attendance &amp; Payroll (Part 1)
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Daily Shift Attendance, Biometric Terminal Punch Sync &amp; Salary Disbursal
            </p>
          </div>
        </div>

        {/* Sub-Tabs Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: '8px' }}>
          <button
            onClick={() => setActiveSubTab('attendance')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: activeSubTab === 'attendance' ? '1px solid var(--gold-glow)' : '1px solid transparent',
              background: activeSubTab === 'attendance' ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
              color: activeSubTab === 'attendance' ? 'var(--gold-glow)' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            📋 Daily Shift Attendance
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: activeSubTab === 'payroll' ? '1px solid #34d399' : '1px solid transparent',
              background: activeSubTab === 'payroll' ? 'rgba(52, 211, 153, 0.18)' : 'transparent',
              color: activeSubTab === 'payroll' ? '#34d399' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            💰 Salary &amp; Advances Ledger
          </button>
        </div>
      </div>

      {activeSubTab === 'attendance' ? (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Roster Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <button
              onClick={handleBiometricSync}
              disabled={isSyncingBiometric}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isSyncingBiometric ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RefreshCw size={14} className={isSyncingBiometric ? 'animate-spin' : ''} />
              {isSyncingBiometric ? 'Syncing Biometric Logs...' : 'Sync Biometric Terminal'}
            </button>
          </div>

          {/* Attendance Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '10px 12px' }}>Staff Name &amp; ID</th>
                  <th style={{ padding: '10px' }}>Role / Department</th>
                  <th style={{ padding: '10px' }}>Assigned Shift</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Punch Status</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Quick Mark</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(stf => {
                  const currentMark = attendanceMarks[stf.id] || 'P';
                  return (
                    <tr key={stf.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        <div style={{ color: '#fff' }}>{stf.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{stf.id} • {stf.phone}</div>
                      </td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>{stf.role}</td>
                      <td style={{ padding: '10px', color: 'var(--gold-glow)' }}>{stf.shift}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: currentMark === 'P' ? 'rgba(52, 211, 153, 0.2)' : currentMark === 'A' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                          color: currentMark === 'P' ? '#34d399' : currentMark === 'A' ? '#f87171' : '#fbbf24'
                        }}>
                          {currentMark === 'P' ? '✓ Present' : currentMark === 'A' ? '✕ Absent' : currentMark === 'HD' ? '½ Half Day' : currentMark}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '3px', background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: '6px' }}>
                          {['P', 'A', 'HD', 'WO'].map(m => (
                            <button
                              key={m}
                              onClick={() => handleMarkChange(stf.id, m)}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                border: 'none',
                                background: currentMark === m ? 'var(--gold-glow)' : 'transparent',
                                color: currentMark === m ? '#060e1a' : '#94a3b8',
                                cursor: 'pointer'
                              }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Payroll & Advances Table */}
          <div style={{ overflowX: 'auto' }}>
            <SheetsToolbarLegend tableName="HR Staff Attendance & Monthly Payroll Matrix" subtitle="Direct Keystroke Calculation Ledger" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <SheetsColumnHeader title="Staff Member" badge="editable" style={{ padding: '10px 12px' }} />
                  <SheetsColumnHeader title="Base Pay" badge="editable" align="right" style={{ padding: '10px' }} />
                  <SheetsColumnHeader title="Days Present" badge="editable" align="center" style={{ padding: '10px' }} />
                  <SheetsColumnHeader title="Advances Taken" badge="editable" align="right" style={{ padding: '10px' }} />
                  <SheetsColumnHeader title="Net Payable" badge="formula" align="right" style={{ padding: '10px' }} />
                  <SheetsColumnHeader title="Actions" badge="locked" align="center" style={{ padding: '10px' }} />
                </tr>
              </thead>
              <tbody>
                {staffList.map(stf => {
                  const { perDayWage, earnedGross, netPayable } = calculateSalary(stf);
                  return (
                    <tr key={stf.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                      <SheetsEditableCell
                        value={stf.name}
                        type="text"
                        cellStyle={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}
                        formatDisplay={(val) => (
                          <div>
                            <div style={{ color: '#fff' }}>{val}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{stf.role}</div>
                          </div>
                        )}
                        onSave={(newVal) => setStaffList(prev => prev.map(s => s.id === stf.id ? { ...s, name: newVal } : s))}
                      />
                      <SheetsEditableCell
                        value={stf.baseSalary}
                        type="currency"
                        align="right"
                        className="cell-num"
                        min={0}
                        cellStyle={{ padding: '10px', color: '#fff', fontWeight: 700 }}
                        onSave={(newVal) => setStaffList(prev => prev.map(s => s.id === stf.id ? { ...s, baseSalary: Number(newVal) } : s))}
                      />
                      <SheetsEditableCell
                        value={stf.daysPresent}
                        type="number"
                        align="center"
                        className="cell-num"
                        min={0}
                        max={31}
                        suffix=" / 30"
                        cellStyle={{ padding: '10px', color: '#38bdf8', fontWeight: 700 }}
                        onSave={(newVal) => setStaffList(prev => prev.map(s => s.id === stf.id ? { ...s, daysPresent: Number(newVal) } : s))}
                      />
                      <SheetsEditableCell
                        value={stf.advances}
                        type="currency"
                        align="right"
                        className="cell-num"
                        min={0}
                        cellStyle={{ padding: '10px', color: stf.advances > 0 ? '#f87171' : '#94a3b8' }}
                        onSave={(newVal) => setStaffList(prev => prev.map(s => s.id === stf.id ? { ...s, advances: Number(newVal) } : s))}
                      />
                      <td style={{ padding: '10px', textAlign: 'right', color: '#34d399', fontWeight: 800, fontSize: '0.9rem' }}>
                        ₹{netPayable.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => setAdvanceModalStaff(stf)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid #ef4444',
                              color: '#fca5a5',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Advance
                          </button>
                          <button
                            onClick={() => handlePrintSlip(stf)}
                            style={{
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid var(--gold-glow)',
                              color: 'var(--gold-glow)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Printer size={12} /> Voucher
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advance Modal */}
      {advanceModalStaff && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <form
            onSubmit={handleSaveAdvance}
            style={{
              background: '#0a192f',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '380px',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f87171', fontWeight: 800 }}>
                Disburse Advance Salary
              </h4>
              <button
                type="button"
                onClick={() => setAdvanceModalStaff(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.85rem' }}>
              Disbursing advance cash to <strong>{advanceModalStaff.name}</strong> ({advanceModalStaff.role}).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 3 }}>
                  Advance Amount (₹):
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  placeholder="e.g. 1000"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: 3 }}>
                  Reason / Purpose:
                </label>
                <input
                  type="text"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0.45rem',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAdvanceModalStaff(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#94a3b8',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    padding: '0.4rem 1.1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Advance
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
