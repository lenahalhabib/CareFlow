"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, CheckCircle, Clock3, AlertCircle, FileText, ChevronRight, User, Stethoscope, Star, Bell } from 'lucide-react';
import { Suspense } from 'react';
import BottomNavigation from "@/shared/components/navigation/BottomNavigation";

// Mock Patient Data
const MOCK_PATIENT = {
  name: "أحمد عبدالله",
  totalCost: 83500,
  paidAmount: 8500,
  upcomingAppointment: {
    doctorName: "د. أحمد خالد",
    hospitalName: "Hospital B",
    date: "12 أكتوبر 2026",
    time: "10:00 صباحاً",
    status: "Pending",
  },
  treatments: [
    { id: 1, name: "أشعة CBCT للفكين كامل", price: 1500, status: "Completed", date: "2 أكتوبر 2026", doctorName: "د. سارة فهد", notes: "تم أخذ الأشعة بنجاح." },
    { id: 2, name: "ترقيع عظم", price: 7000, status: "Completed", date: "5 أكتوبر 2026", doctorName: "د. أحمد خالد", notes: "تم الترقيع بنجاح." },
    { id: 3, name: "رفع الجيب الأنفي", price: 10000, status: "NoShow", date: "تخلف عن الحضور (12 أكتوبر)", doctorName: "د. أحمد خالد" },
    { id: 4, name: "زرعة زيجماتيك", price: 20000, status: "Pending", date: "مجدول لاحقاً", doctorName: "د. أحمد خالد" },
    { id: 5, name: "تركيب فك كامل على 6 زرعات", price: 45000, status: "Pending", date: "مجدول لاحقاً", doctorName: "د. عمر عبدالله" },
  ],
  noShowReason: null,
};

function PatientDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");
  const [patientData, setPatientData] = useState(MOCK_PATIENT);

  useEffect(() => {
    const statusQuery = searchParams?.get('status');
    const hospitalQuery = searchParams?.get('hospital');
    const doctorQuery = searchParams?.get('doctor');

    // Read dynamically booked treatments if available
    let dynamicTreatments = null;
    let dynamicTotal = 0;
    try {
      const saved = localStorage.getItem("bookedTreatments");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dynamicTotal = parsed.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
          dynamicTreatments = parsed.map((item, index) => ({
            id: index + 1,
            name: item.serviceName || item.service?.display_name || 'Service',
            price: item.totalPrice || 0,
            status: index === 0 ? "Pending" : "Pending", // Mock everything as pending
            date: index === 0 ? "مجدول (12 أكتوبر)" : "مجدول لاحقاً",
            doctorName: doctorQuery || "Dr. Ahmed Khalid",
            notes: ""
          }));
        }
      }
    } catch (e) {}

    setPatientData(prev => ({
      ...prev,
      totalCost: dynamicTreatments ? dynamicTotal : prev.totalCost,
      treatments: dynamicTreatments || prev.treatments,
      upcomingAppointment: {
        ...prev.upcomingAppointment,
        hospitalName: hospitalQuery || prev.upcomingAppointment.hospitalName,
        doctorName: doctorQuery || prev.upcomingAppointment.doctorName,
      }
    }));

    if (statusQuery === 'pending') {
       setPatientData(prev => ({
         ...prev,
         upcomingAppointment: { ...prev.upcomingAppointment, status: 'Pending' }
       }));
       
       const timer = setTimeout(() => {
         setPatientData(prev => ({
           ...prev,
           upcomingAppointment: { ...prev.upcomingAppointment, status: 'Confirmed' }
         }));
       }, 3000);
       
       return () => clearTimeout(timer);
    } else {
       setPatientData(prev => ({
         ...prev,
         upcomingAppointment: { ...prev.upcomingAppointment, status: 'Confirmed' }
       }));
    }
  }, [searchParams]);

  const handleSimulateNoShow = () => {
    setShowNoShowModal(true);
  };

  const submitNoShowReason = () => {
    setPatientData({ ...patientData, noShowReason: noShowReason as any });
    setShowNoShowModal(false);
    setShowSuccessModal(true);
  };

  const completedCount = patientData.treatments.filter(t => t.status === "Completed").length;
  const totalCount = patientData.treatments.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-[#476973] text-white pt-12 pb-6 px-6 rounded-b-[40px] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm opacity-80">مرحباً بك،</p>
            <h1 className="text-2xl font-bold">{patientData.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition">
               <Bell size={24} />
               <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#476973]"></span>
            </button>
            <div className="w-12 h-12 bg-[#DCE7E6] text-[#476973] rounded-full flex items-center justify-center shadow-sm">
               <User size={24} />
            </div>
          </div>
        </div>
        
        {/* Plan and Hospital Summary - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Hospital Box */}
          <div className="bg-white text-[#476973] rounded-3xl p-4 shadow-sm flex flex-col justify-between">
             <div>
               <p className="text-xs opacity-70 mb-1">المستشفى المختار</p>
               <h3 className="font-bold text-sm">{patientData.upcomingAppointment.hospitalName}</h3>
               <p className="text-xs opacity-70 mt-1 flex items-center gap-1"><Star size={12} className="fill-[#476973]"/> تقييم 4.9/5</p>
             </div>
             <div className="mt-3 pt-3 border-t border-[#476973]/10">
               <p className="font-bold text-sm">76,226 SAR</p>
               <p className="text-[10px] text-green-600 font-bold mt-0.5">توفير 7,274 SAR</p>
             </div>
          </div>
          
          {/* Plan Box */}
          <div className="bg-white text-[#476973] rounded-3xl p-4 shadow-sm flex flex-col justify-between">
             <div>
               <p className="text-xs opacity-70 mb-1">Original Plan</p>
               <h3 className="font-bold text-sm line-through opacity-50">83,000 SAR</h3>
               <p className="text-xs opacity-70 mt-1">Duration: 7-15 months</p>
             </div>
             <div className="mt-3 pt-3 border-t border-[#476973]/10">
               <p className="font-bold text-xs flex items-center gap-1"><Stethoscope size={12}/> {patientData.upcomingAppointment.doctorName}</p>
               <p className="text-[10px] opacity-70 mt-0.5">{patientData.treatments.length} Scheduled Procedures</p>
             </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl p-5 border border-white/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div className="bg-white h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Completed: {completedCount} procedure</span>
            <span>Remaining: {totalCount - completedCount} procedures</span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6">
        
        {/* Next Appointment Card */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-[#476973]">Upcoming Appointment</h2>
             <button onClick={handleSimulateNoShow} className="text-xs text-[#476973]/50 underline">Simulate No-Show</button>
          </div>
          
          <div className="bg-[#F8FBFA] rounded-[30px] p-5 shadow-sm border border-[#476973]/10 relative overflow-hidden">
            {patientData.upcomingAppointment.status === 'Pending' && (
              <div className="absolute inset-0 bg-[#F8FBFA]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                 <div className="w-8 h-8 border-2 border-[#D4E0DF] border-t-[#476973] rounded-full animate-spin mb-2"></div>
                 <p className="font-bold text-[#476973] text-sm">Waiting for doctor confirmation...</p>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4 border-b border-[#476973]/10 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#476973] flex items-center gap-2">
                  <Stethoscope size={18}/> {patientData.upcomingAppointment.doctorName}
                </h3>
                <p className="text-sm text-[#476973]/70 mt-1">{patientData.upcomingAppointment.hospitalName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${patientData.upcomingAppointment.status === 'Confirmed' ? 'bg-[#D4E0DF] text-[#476973]' : 'bg-orange-100 text-orange-600'}`}>
                {patientData.upcomingAppointment.status === 'Confirmed' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            
            <div className="flex gap-6 text-[#476973] font-medium text-sm">
              <div className="flex items-center gap-2"><Calendar size={18}/> {patientData.upcomingAppointment.date}</div>
              <div className="flex items-center gap-2"><Clock size={18}/> {patientData.upcomingAppointment.time}</div>
            </div>
            
            <div className="mt-5 flex gap-3">
               <button className="flex-1 bg-[#476973] text-white py-3 rounded-2xl font-bold hover:bg-[#3d5d66] transition text-sm">Edit Date</button>
               <button className="flex-1 bg-white border border-[#476973]/20 text-[#476973] py-3 rounded-2xl font-bold hover:bg-[#F8FBFA] transition text-sm flex justify-center items-center gap-2"><MapPin size={16}/> Location</button>
            </div>
          </div>
        </div>

        {/* Treatment Plan Details */}
        <div>
          <h2 className="text-xl font-bold text-[#476973] mb-4">Treatment Plan Details</h2>
          <div className="bg-[#F8FBFA] rounded-[30px] p-5 shadow-sm border border-[#476973]/10 space-y-4">
            
            {patientData.treatments.map((t, i) => (
              <div key={t.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.status === 'Completed' ? 'bg-[#476973] text-white' : t.status === 'NoShow' ? 'bg-red-100 text-red-500 cursor-pointer animate-pulse' : 'bg-[#D4E0DF] text-[#476973]/50'}`} onClick={t.status === 'NoShow' ? handleSimulateNoShow : undefined}>
                    {t.status === 'Completed' ? <CheckCircle size={18} /> : t.status === 'NoShow' ? <AlertCircle size={18} /> : <Clock3 size={18} />}
                  </div>
                  {i !== patientData.treatments.length - 1 && (
                    <div className="w-[2px] h-full bg-[#D4E0DF] my-1"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start">
                    <p className={`font-bold ${t.status === 'Completed' ? 'text-[#476973]' : t.status === 'NoShow' ? 'text-red-500' : 'text-[#476973]/70'}`}>{t.name}</p>
                    <span className={`font-bold text-sm ${t.status === 'NoShow' ? 'text-red-500/70' : 'text-[#476973]'}`}>{t.price} SAR</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs ${t.status === 'NoShow' ? 'text-red-500 font-medium' : 'text-[#476973]/60'}`}>{t.date}</p>
                    <p className="text-[11px] font-bold text-[#476973]/80 bg-[#D4E0DF]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Stethoscope size={10} /> {t.doctorName}
                    </p>
                  </div>
                  
                  {t.status === 'NoShow' && (
                    <button onClick={handleSimulateNoShow} className="mt-2 text-xs font-bold text-red-500 underline bg-red-50 px-3 py-1.5 rounded-full inline-block">Provide absence reason</button>
                  )}
                  
                  {t.status === 'Completed' && t.notes && (
                    <div className="mt-3 bg-[#D4E0DF]/30 p-3 rounded-2xl flex gap-3 items-start border border-[#476973]/10">
                       <FileText size={16} className="text-[#476973] shrink-0 mt-0.5" />
                       <div className="text-sm text-[#476973]">
                         <p className="font-semibold mb-1">وصف الجلسة:</p>
                         <p className="opacity-80 leading-relaxed">{t.notes}</p>
                         <button className="mt-2 text-xs font-bold underline flex items-center gap-1">عرض المرفقات <ChevronRight size={12}/></button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
          </div>
        </div>

      </section>

      {/* No-Show Modal */}
      {showNoShowModal && (
        <div className="fixed inset-0 bg-[#476973]/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="bg-[#F8FBFA] rounded-[36px] p-6 w-full max-w-md shadow-xl text-right">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#476973] text-center mb-2">نأسف لعدم حضورك الموعد</h3>
            <p className="text-sm text-[#476973]/70 text-center mb-6 leading-relaxed">
              لقد سجل الطبيب عدم حضورك للموعد الأخير. لمساعدتنا في تقديم خيارات أفضل لك، نرجو اختيار سبب عدم الحضور:
            </p>
            
            <div className="space-y-3 mb-6 text-right">
              {['السعر لم يكن مناسباً', 'المستشفى بعيد عني', 'لا يشمل التأمين الطبي الخاص بي', 'حجزت موعد في عيادة أخرى', 'ظرف طارئ'].map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 border border-[#476973]/20 rounded-2xl cursor-pointer hover:bg-[#D4E0DF]/20 transition">
                  <input type="radio" name="noshow" value={reason} onChange={(e) => setNoShowReason(e.target.value)} className="w-4 h-4 text-[#476973] focus:ring-[#476973]" />
                  <span className="text-[#476973] font-medium text-sm">{reason}</span>
                </label>
              ))}
            </div>
            
            <button 
              onClick={submitNoShowReason}
              disabled={!noShowReason}
              className="w-full bg-[#476973] text-white py-4 rounded-2xl font-bold disabled:opacity-50 hover:bg-[#3d5d66] transition"
            >
              إرسال وعرض بدائل
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#476973]/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#2A2A2A] rounded-[24px] p-6 w-full max-w-sm shadow-2xl text-center text-white border border-white/10 relative">
            <p className="text-lg font-medium leading-relaxed mb-6">
              تم تسجيل السبب وبناءً عليه تم إعادة جدولة الخيارات وتقديم البدائل المناسبة لك!
            </p>
            <div className="flex justify-start">
              <button onClick={() => router.push('/hospital/comparison?isAlternative=true')} className="bg-white text-[#2A2A2A] px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition">
                موافق
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </main>
  );
}

export default function PatientDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#D4E0DF] flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#D4E0DF] border-t-[#476973] rounded-full animate-spin"></div></div>}>
      <PatientDashboardContent />
    </Suspense>
  );
}
