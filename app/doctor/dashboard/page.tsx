"use client";

import { useState } from 'react';
import { ServicePrice, TreatmentPlan, Appointment, TreatmentDay, PlanStep } from '../../../types/doctor';
import { Check, X, Calendar, Clock, Plus, Trash2, UploadCloud, User, ArrowRight, Hourglass, CalendarDays, Users, Stethoscope, ChevronDown, ChevronUp, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'services'>('active');

  // --- Mock Data ---
  const [services, setServices] = useState<ServicePrice[]>([
    { id: '1', doctorId: 'd1', serviceName: 'Zygomatic Implant', priceSAR: 15000, isActive: true },
    { id: '2', doctorId: 'd1', serviceName: 'Bone Graft', priceSAR: 2500, isActive: true },
    { id: '3', doctorId: 'd1', serviceName: 'Sinus Lift', priceSAR: 3000, isActive: true },
    { id: '4', doctorId: 'd1', serviceName: 'CBCT Scan', priceSAR: 350, isActive: true },
    { id: '5', doctorId: 'd1', serviceName: 'Teeth Cleaning', priceSAR: 300, isActive: true },
  ]);

  const [appointment, setAppointment] = useState<Appointment>({
    id: 'a1',
    patientId: 'p1',
    patientName: 'Omar Khalid',
    doctorId: 'd1',
    planId: 'plan_new',
    requestedDate: '2026-10-15',
    requestedTime: '10:00 AM',
    status: 'Pending',
  });

  const [newPlan, setNewPlan] = useState<TreatmentPlan>({
    id: 'plan_new',
    patientId: 'p1',
    patientName: 'Omar Khalid',
    doctorId: 'd1',
    totalCost: 15350,
    totalDays: 1,
    aiGenerated: true,
    status: 'Pending_Approval',
    days: [
      {
        id: 'day1', dayNumber: 1, date: '2026-10-15', status: 'Scheduled', gapDaysToNext: 0,
        steps: [
          { id: 's1', treatmentName: 'CBCT Scan', priceSAR: 350, status: 'Pending' },
          { id: 's4', treatmentName: 'Zygomatic Implant', priceSAR: 15000, status: 'Pending' },
        ]
      }
    ]
  });

  // Mock Active Patients Plans
  const [activePlans, setActivePlans] = useState<TreatmentPlan[]>([
    {
      id: 'plan1',
      patientId: 'p2',
      patientName: 'Ahmed Abdullah',
      doctorId: 'd1',
      totalCost: 20850,
      totalDays: 25,
      aiGenerated: true,
      status: 'In_Progress',
      days: [
        {
          id: 'day1', dayNumber: 1, date: '2026-10-02', status: 'Today', gapDaysToNext: 5,
          notes: '',
          attachments: [],
          steps: [
            { id: 's1', treatmentName: 'CBCT Scan', priceSAR: 350, status: 'Pending' },
            { id: 's2', treatmentName: 'Teeth Cleaning', priceSAR: 300, status: 'Pending' }
          ]
        },
        {
          id: 'day2', dayNumber: 2, date: '2026-10-07', status: 'Scheduled', gapDaysToNext: 10,
          steps: [
            { id: 's3', treatmentName: 'Bone Graft', priceSAR: 2500, status: 'Pending' },
            { id: 's4', treatmentName: 'Sinus Lift', priceSAR: 3000, status: 'Pending' }
          ]
        },
        {
          id: 'day3', dayNumber: 3, date: '2026-10-17', status: 'Scheduled', gapDaysToNext: 10,
          steps: [
            { id: 's5', treatmentName: 'Zygomatic Implant', priceSAR: 15000, status: 'Pending' }
          ]
        },
        {
          id: 'day4', dayNumber: 4, date: '2026-10-27', status: 'Scheduled', gapDaysToNext: 0,
          steps: [
            { id: 's6', treatmentName: 'Follow up & Suture Removal', priceSAR: 0, status: 'Pending' }
          ]
        }
      ]
    },
    {
      id: 'plan2',
      patientId: 'p3',
      patientName: 'Yara Mohammed',
      doctorId: 'd1',
      totalCost: 5000,
      totalDays: 14,
      aiGenerated: true,
      status: 'In_Progress',
      days: [
        {
          id: 'day1_y', dayNumber: 1, date: '2026-09-25', status: 'Completed', gapDaysToNext: 14,
          steps: [
            { id: 's1_y', treatmentName: 'Root Canal', priceSAR: 2500, status: 'Completed' }
          ]
        },
        {
          id: 'day2_y', dayNumber: 2, date: '2026-10-09', status: 'Scheduled', gapDaysToNext: 0,
          steps: [
            { id: 's2_y', treatmentName: 'Zirconia Crown', priceSAR: 2500, status: 'Pending' }
          ]
        }
      ]
    }
  ]);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [addingProcedureToDay, setAddingProcedureToDay] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // --- Handlers for TAB 1 (Requests) ---
  const handleApproveAppointment = () => {
    setAppointment({ ...appointment, status: 'Approved' });
    setNewPlan({ ...newPlan, status: 'Approved' });
    alert('Appointment and treatment plan approved.');
  };

  const handleRejectAppointment = () => {
    const reason = prompt('Enter reason for rejecting the plan or appointment:');
    if (reason) {
      setAppointment({ ...appointment, status: 'Cancelled', cancellationReason: reason });
      setNewPlan({ ...newPlan, status: 'Rejected', rejectionReason: reason });
      alert('Request rejected successfully.');
    }
  };

  // --- Handlers for TAB 2 (Timeline / Active Plans) ---
  const currentPlan = activePlans.find(p => p.id === selectedPlanId);

  const updateCurrentPlan = (updatedPlan: TreatmentPlan) => {
    // Recalculate dates based on gap days
    let currentDate = new Date(updatedPlan.days[0].date);
    let totalCost = 0;

    const recalculatedDays = updatedPlan.days.map((day, index) => {
      // Calculate total cost for non-removed steps
      totalCost += day.steps.filter(s => s.status !== 'Removed').reduce((sum, step) => sum + step.priceSAR, 0);

      const computedDate = currentDate.toISOString().split('T')[0];
      
      // Add gap days for the NEXT day
      if (day.gapDaysToNext > 0) {
        currentDate.setDate(currentDate.getDate() + day.gapDaysToNext);
      }

      return { ...day, date: computedDate, dayNumber: index + 1 };
    });

    const totalDays = recalculatedDays.reduce((sum, day) => sum + (day.gapDaysToNext || 0), 0);

    const finalPlan = { ...updatedPlan, days: recalculatedDays, totalCost, totalDays };
    setActivePlans(activePlans.map(p => p.id === finalPlan.id ? finalPlan : p));
  };

  const handleAttendance = (dayId: string, attended: boolean) => {
    if (!currentPlan) return;
    const updatedDays = currentPlan.days.map(d => {
      if (d.id === dayId) {
        return { ...d, status: attended ? 'In_Progress' : 'No_Show' } as any;
      }
      return d;
    });
    updateCurrentPlan({ ...currentPlan, days: updatedDays });
    if (!attended) alert('No-show recorded. The patient will be notified and rescheduled.');
  };

  const handleAddPlanStep = (dayId: string, serviceId: string) => {
    if (!currentPlan) return;
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newStep = { id: Date.now().toString(), treatmentName: service.serviceName, priceSAR: service.priceSAR, status: 'Pending' as const };
      const updatedDays = currentPlan.days.map(d => {
        if (d.id === dayId) {
          return { ...d, steps: [...d.steps, newStep] };
        }
        return d;
      });
      updateCurrentPlan({ ...currentPlan, days: updatedDays });
      setAddingProcedureToDay(null);
      setSelectedServiceId('');
    }
  };

  const handleRemovePlanStep = (dayId: string, stepId: string) => {
    if (!currentPlan) return;
    const reason = prompt('Reason for removing the procedure:');
    if (reason) {
      const updatedDays = currentPlan.days.map(d => {
        if (d.id === dayId) {
          return {
            ...d,
            steps: d.steps.map(s => s.id === stepId ? { ...s, status: 'Removed' as const, removedReason: reason } : s)
          };
        }
        return d;
      });
      updateCurrentPlan({ ...currentPlan, days: updatedDays });
    }
  };

  const handleMarkStepCompleted = (dayId: string, stepId: string) => {
    if (!currentPlan) return;
    const updatedDays = currentPlan.days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          steps: d.steps.map(s => s.id === stepId ? { ...s, status: 'Completed' as const } : s)
        };
      }
      return d;
    });
    updateCurrentPlan({ ...currentPlan, days: updatedDays });
  };

  const handleUpdateGapDays = (dayId: string, newGap: number) => {
    if (!currentPlan || newGap < 0) return;
    const updatedDays = currentPlan.days.map(d => d.id === dayId ? { ...d, gapDaysToNext: newGap } : d);
    updateCurrentPlan({ ...currentPlan, days: updatedDays });
  };

  const handleAddNewDay = () => {
    if (!currentPlan) return;
    const newDay: TreatmentDay = {
      id: Date.now().toString(),
      dayNumber: currentPlan.days.length + 1,
      date: '', // Will be recalculated
      status: 'Scheduled',
      gapDaysToNext: 0,
      steps: []
    };
    
    // Default 7 days gap from the last appointment
    const updatedDays = [...currentPlan.days];
    if (updatedDays.length > 0) {
      updatedDays[updatedDays.length - 1].gapDaysToNext = 7;
    }
    updatedDays.push(newDay);

    updateCurrentPlan({ ...currentPlan, days: updatedDays });
  };

  const handleSyncPlan = () => {
    alert(`Plan synchronized successfully with the patient!\nTotal Cost: ${currentPlan?.totalCost} SAR\nTotal Duration: ${currentPlan?.totalDays} days`);
  };

  // --- Handlers for TAB 3 (Services) ---
  const handleAddService = () => {
    setServices([...services, { id: Date.now().toString(), doctorId: 'd1', serviceName: 'New Service', priceSAR: 0, isActive: true }]);
  };

  const handleUpdateService = (id: string, field: string, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="min-h-screen bg-[#D4E0DF] flex flex-col font-sans" dir="ltr">
      {/* Header */}
      <header className="bg-[#476973] text-[#DCE7E6] p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif tracking-tight flex items-center gap-2">
            <img src="/logo.png" alt="CareFlow" className="h-16 w-auto object-contain" />
            <span className="text-xl font-sans opacity-80">| Doctor Portal</span>
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Dr. Ahmed Khalid (Implant Consultant)</span>
            <div className="w-9 h-9 bg-[#DCE7E6] text-[#476973] rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-[#F8FBFA] rounded-[24px] shadow-sm p-4 h-fit space-y-2">
          <button onClick={() => {setActiveTab('requests'); setSelectedPlanId(null)}} className={`w-full text-left p-4 rounded-2xl transition-all font-semibold ${activeTab === 'requests' ? 'bg-[#476973] text-white shadow-md' : 'text-[#476973] hover:bg-[#D4E0DF]/40'}`}>
            New Appointment Requests
          </button>
          <button onClick={() => setActiveTab('active')} className={`w-full text-left p-4 rounded-2xl transition-all font-semibold ${activeTab === 'active' ? 'bg-[#476973] text-white shadow-md' : 'text-[#476973] hover:bg-[#D4E0DF]/40'}`}>
            Interactive Patient Plans
          </button>
          <button onClick={() => {setActiveTab('services'); setSelectedPlanId(null)}} className={`w-full text-left p-4 rounded-2xl transition-all font-semibold ${activeTab === 'services' ? 'bg-[#476973] text-white shadow-md' : 'text-[#476973] hover:bg-[#D4E0DF]/40'}`}>
            Services & Pricing
          </button>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 bg-[#F8FBFA] rounded-[36px] shadow-sm p-8">
          
          {/* TAB 1: Requests */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-3xl font-serif text-[#476973] mb-8">Review Initial Plan & Appointments</h2>
              {appointment.status === 'Pending' ? (
                <div className="border border-[#476973]/20 rounded-3xl p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#476973]">Patient: {appointment.patientName}</h3>
                      <div className="flex gap-4 text-[#476973]/70 mt-2 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Calendar size={18}/> {appointment.requestedDate}</span>
                        <span className="flex items-center gap-1.5"><Clock size={18}/> {appointment.requestedTime}</span>
                      </div>
                    </div>
                    <span className="bg-[#D4E0DF] text-[#476973] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">AI Proposed Plan</span>
                  </div>
                  
                  <div className="mt-6 bg-[#F8FBFA] p-5 rounded-2xl border border-[#476973]/10">
                    <h4 className="font-bold text-[#476973] mb-4 border-b border-[#476973]/10 pb-3">Proposed Treatment Plan:</h4>
                    <ul className="space-y-3">
                      {newPlan.days[0].steps.map(step => (
                        <li key={step.id} className="flex justify-between items-center text-sm text-[#476973]">
                          <span>{step.treatmentName}</span>
                          <span className="font-bold">{step.priceSAR} SAR</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 pt-4 border-t border-[#476973]/10 flex justify-between font-bold text-lg text-[#476973]">
                      <span>Estimated Total:</span>
                      <span>{newPlan.totalCost} SAR</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button onClick={handleApproveAppointment} className="flex-1 bg-[#476973] hover:bg-[#3d5d66] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Check size={20}/> Approve Appointment & Plan
                    </button>
                    <button onClick={handleRejectAppointment} className="flex-1 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition">
                      <X size={20}/> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-[#476973]/50 font-medium text-lg">No pending requests available.</div>
              )}
            </div>
          )}

          {/* TAB 2: Active Appointment / Timeline */}
          {activeTab === 'active' && (
            <div>
              {!selectedPlanId ? (
                <>
                  <h2 className="text-3xl font-serif text-[#476973] mb-8">Active Patients</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlans.map(p => (
                      <div key={p.id} onClick={() => setSelectedPlanId(p.id)} className="bg-white border border-[#476973]/20 rounded-2xl p-5 hover:shadow-md cursor-pointer transition">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-[#476973] flex items-center gap-2"><Users size={20}/> {p.patientName}</h3>
                          <span className="bg-[#D4E0DF] text-[#476973] text-xs px-2 py-1 rounded-md font-bold">{p.days.length} appointments</span>
                        </div>
                        <div className="text-sm text-[#476973]/70 space-y-1">
                          <p>Total Cost: <span className="font-bold">{p.totalCost} SAR</span></p>
                          <p>Estimated Duration: <span className="font-bold">{p.totalDays} days</span></p>
                        </div>
                        <div className="mt-4 text-[#476973] font-bold text-sm flex items-center gap-1">
                          Open Plan & Calendar <ArrowRight size={16}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : currentPlan ? (
                <div>
                  {/* Plan Header */}
                  <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-[#476973]/20 shadow-sm">
                    <div>
                      <button onClick={() => setSelectedPlanId(null)} className="text-[#476973]/60 hover:text-[#476973] text-sm mb-2 flex items-center gap-1 font-bold">
                         Back to List
                      </button>
                      <h2 className="text-3xl font-serif text-[#476973]">Plan: {currentPlan.patientName}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-sm text-[#476973]/70">Total Plan Cost (Updated)</p>
                       <p className="text-2xl font-bold text-[#476973]">{currentPlan.totalCost} SAR</p>
                       <button onClick={handleSyncPlan} className="mt-2 bg-[#476973] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#3d5d66] transition">
                         Save & Sync with Patient
                       </button>
                    </div>
                  </div>

                  {/* Timeline view */}
                  <div className="space-y-4">
                    {currentPlan.days.map((day, index) => (
                      <div key={day.id} className="relative">
                        {/* Day Card */}
                        <div className={`border rounded-3xl p-6 shadow-sm transition-all ${day.status === 'Today' || day.status === 'In_Progress' ? 'bg-white border-[#476973] ring-2 ring-[#476973]/20' : day.status === 'Completed' ? 'bg-[#F8FBFA] border-[#476973]/10 opacity-80' : 'bg-white border-[#476973]/20'}`}>
                          
                          {/* Card Header */}
                          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 border-b border-[#476973]/10 pb-4">
                            <div>
                              <h3 className="font-bold text-xl text-[#476973] flex items-center gap-2">
                                <CalendarDays size={22}/> Day {day.dayNumber}
                                <span className="text-sm font-normal opacity-70">({day.date})</span>
                              </h3>
                            </div>
                            
                            {/* Status & Attendance */}
                            <div>
                              {day.status === 'Completed' && <span className="bg-[#D4E0DF] text-[#476973] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">Completed</span>}
                              {day.status === 'Scheduled' && <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold">Scheduled</span>}
                              {day.status === 'No_Show' && (
                                <div className="flex items-center gap-2">
                                  <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold border border-red-100">No-Show</span>
                                  <button className="text-xs bg-white border border-[#476973]/20 text-[#476973] px-3 py-1.5 rounded-xl hover:bg-[#F8FBFA] font-bold">Reschedule</button>
                                </div>
                              )}
                              {day.status === 'Today' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleAttendance(day.id, true)} className="bg-[#476973] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#3d5d66] transition flex items-center gap-1"><Check size={16}/> Patient Attended</button>
                                  <button onClick={() => handleAttendance(day.id, false)} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition flex items-center gap-1"><X size={16}/> No-Show</button>
                                </div>
                              )}
                              {day.status === 'In_Progress' && <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold border border-green-200">Active Session</span>}
                            </div>
                          </div>

                          {/* Editable Steps */}
                          <div className="space-y-3 mb-6">
                            {day.steps.map(step => (
                              <div key={step.id} className={`flex justify-between items-center p-3 border border-[#476973]/10 rounded-2xl ${step.status === 'Removed' ? 'bg-red-50/50 opacity-60' : step.status === 'Completed' ? 'bg-[#D4E0DF]/20' : 'bg-[#F8FBFA]'}`}>
                                <div>
                                  <p className={`font-semibold text-[#476973] ${step.status === 'Removed' ? 'line-through opacity-70' : ''}`}>{step.treatmentName}</p>
                                  {step.status === 'Removed' && <p className="text-xs text-red-500 mt-1 font-medium">Removal Reason: {step.removedReason}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-[#476973]">{step.priceSAR} SAR</span>
                                  
                                  {(day.status === 'In_Progress' || day.status === 'Scheduled' || day.status === 'Today') && step.status === 'Pending' && (
                                    <div className="flex gap-2">
                                      {day.status === 'In_Progress' && <button onClick={() => handleMarkStepCompleted(day.id, step.id)} className="text-[#476973] bg-[#D4E0DF] p-1.5 rounded-lg hover:bg-[#476973] hover:text-white transition" title="Complete"><Check size={16}/></button>}
                                      <button onClick={() => handleRemovePlanStep(day.id, step.id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg hover:bg-red-500 hover:text-white transition" title="Remove Procedure"><Trash2 size={16}/></button>
                                    </div>
                                  )}
                                  {step.status === 'Completed' && <span className="text-[#476973] text-xs font-bold bg-[#D4E0DF] px-2 py-1 rounded-md">Done</span>}
                                </div>
                              </div>
                            ))}
                            
                            {addingProcedureToDay === day.id ? (
                              <div className="p-4 border-2 border-[#476973]/30 rounded-2xl bg-[#D4E0DF]/10 mb-4">
                                <label className="block text-sm font-bold text-[#476973] mb-2">Select Service</label>
                                <select 
                                  className="w-full p-3 rounded-xl border border-[#476973]/30 bg-white text-[#476973] outline-none mb-3"
                                  value={selectedServiceId}
                                  onChange={(e) => setSelectedServiceId(e.target.value)}
                                >
                                  <option value="">-- Choose a service --</option>
                                  {services.filter(s => s.isActive).map(s => (
                                    <option key={s.id} value={s.id}>{s.serviceName} ({s.priceSAR} SAR)</option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <button onClick={() => handleAddPlanStep(day.id, selectedServiceId)} disabled={!selectedServiceId} className="flex-1 bg-[#476973] text-white py-2 rounded-xl font-bold hover:bg-[#3d5d66] disabled:opacity-50">Add</button>
                                  <button onClick={() => {setAddingProcedureToDay(null); setSelectedServiceId('');}} className="flex-1 bg-white text-[#476973] border border-[#476973]/20 py-2 rounded-xl font-bold hover:bg-[#F8FBFA]">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              (day.status === 'In_Progress' || day.status === 'Scheduled' || day.status === 'Today') && (
                                <button onClick={() => setAddingProcedureToDay(day.id)} className="w-full py-3 border-2 border-dashed border-[#476973]/30 rounded-2xl text-[#476973] font-bold text-sm hover:bg-[#D4E0DF]/20 transition flex items-center justify-center gap-2 mb-4">
                                  <Plus size={18}/> Add procedure to this day
                                </button>
                              )
                            )}
                          </div>

                          {/* Day Attachments & Notes (Unlocked if In_Progress, Completed, or Today) */}
                          {(day.status === 'In_Progress' || day.status === 'Completed' || day.status === 'Today') && (
                            <div className="bg-[#F8FBFA] p-5 rounded-2xl border border-[#476973]/10">
                               <h4 className="font-bold text-[#476973] mb-3 text-sm flex items-center gap-2"><Stethoscope size={16}/> Session Notes & Attachments</h4>
                               <textarea 
                                  placeholder="Doctor notes, prescriptions, case documentation..." 
                                  className="w-full p-3 bg-white border border-[#476973]/20 rounded-xl mb-4 text-[#476973] outline-none focus:border-[#476973] text-sm" 
                                  rows={3}
                                  value={day.notes || ''}
                                  onChange={(e) => {
                                    const updatedDays = currentPlan.days.map(d => d.id === day.id ? {...d, notes: e.target.value} : d);
                                    updateCurrentPlan({...currentPlan, days: updatedDays});
                                  }}
                                  readOnly={day.status === 'Completed'}
                                />
                                {(day.status === 'In_Progress' || day.status === 'Today') && (
                                  <div className="border-2 border-dashed border-[#476973]/30 bg-white rounded-xl p-4 text-center hover:bg-[#D4E0DF]/20 transition cursor-pointer">
                                    <UploadCloud className="mx-auto text-[#476973]/50 mb-2" size={24}/>
                                    <p className="text-[#476973] text-sm font-semibold">Attach X-Rays (CBCT, Pano) or Session Images</p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {/* AI Gap Days Indicator (between days) */}
                        {index < currentPlan.days.length - 1 && (
                          <div className="flex flex-col items-center justify-center py-3 relative">
                            <div className="absolute h-full w-[2px] bg-[#476973]/20 z-0"></div>
                            <div className="z-10 bg-[#D4E0DF] text-[#476973] px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center gap-3 border border-[#476973]/20">
                              <Hourglass size={16}/> 
                              <span>AI Suggested Gap:</span>
                              <div className="flex items-center bg-white rounded-lg px-2 py-1 border border-[#476973]/20">
                                <button onClick={() => handleUpdateGapDays(day.id, day.gapDaysToNext - 1)} className="text-[#476973] hover:bg-[#D4E0DF] rounded px-1"><ChevronDown size={14}/></button>
                                <span className="mx-3">{day.gapDaysToNext} days</span>
                                <button onClick={() => handleUpdateGapDays(day.id, day.gapDaysToNext + 1)} className="text-[#476973] hover:bg-[#D4E0DF] rounded px-1"><ChevronUp size={14}/></button>
                              </div>
                              <span className="text-xs font-normal opacity-70 border-l border-[#476973]/30 pl-3 ml-1">Recovery</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Day Button */}
                  <div className="mt-8 text-center">
                     <button onClick={handleAddNewDay} className="bg-white border-2 border-dashed border-[#476973]/40 text-[#476973] px-6 py-3 rounded-2xl font-bold hover:bg-[#F8FBFA] transition shadow-sm flex items-center gap-2 mx-auto">
                        <Plus size={20}/> Add new day/appointment to plan
                     </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: Services & Pricing */}
          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif text-[#476973]">Services & Pricing Management</h2>
                <button onClick={handleAddService} className="bg-[#476973] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-[#3d5d66] transition shadow-sm">
                  <Plus size={18}/> Add Service
                </button>
              </div>

              <div className="bg-white border border-[#476973]/20 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[#476973]">
                  <thead className="bg-[#F8FBFA] border-b border-[#476973]/10">
                    <tr>
                      <th className="p-5 font-bold">Service Name</th>
                      <th className="p-5 font-bold w-40">Price (SAR)</th>
                      <th className="p-5 font-bold w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id} className="border-b border-[#476973]/10 last:border-0 hover:bg-[#F8FBFA]/50 transition">
                        <td className="p-4">
                          <input 
                            type="text" 
                            value={service.serviceName} 
                            onChange={(e) => handleUpdateService(service.id, 'serviceName', e.target.value)}
                            className="w-full p-2.5 bg-transparent border border-transparent hover:border-[#476973]/20 rounded-xl focus:border-[#476973] focus:bg-white focus:outline-none transition font-medium"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            value={service.priceSAR} 
                            onChange={(e) => handleUpdateService(service.id, 'priceSAR', Number(e.target.value))}
                            className="w-full p-2.5 bg-transparent border border-transparent hover:border-[#476973]/20 rounded-xl focus:border-[#476973] focus:bg-white focus:outline-none transition font-bold"
                          />
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleUpdateService(service.id, 'isActive', !service.isActive)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition shadow-sm ${service.isActive ? 'bg-[#476973] text-white' : 'bg-red-50 text-red-600 border border-red-100'}`}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
