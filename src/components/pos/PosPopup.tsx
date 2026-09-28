import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface PosPopupProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

const PosPopup: React.FC<PosPopupProps> = ({ message, onClose, type = 'error' }) => {
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="bg-white rounded-3xl w-full max-w-sm z-10 p-8 shadow-2xl animate-fade-in-up text-center border border-slate-100 relative overflow-hidden">
        {/* Subtle decorative background for success */}
        {isSuccess && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        )}
        {!isSuccess && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        )}

        <div className={`relative mx-auto w-20 h-20 mb-6 rounded-full flex items-center justify-center ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isSuccess ? (
            <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
          ) : (
            <AlertTriangle className="w-10 h-10" strokeWidth={2.5} />
          )}
        </div>

        <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight relative">
          {isSuccess ? 'Order Placed!' : 'Oops!'}
        </h3>

        <p className="text-slate-500 mb-8 leading-relaxed font-medium relative text-sm">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`relative w-full px-4 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
            isSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200/50' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200/50'
          }`}
        >
          {isSuccess ? 'START NEW ORDER' : 'TRY AGAIN'}
        </button>
      </div>
    </div>
  );
};

export default PosPopup;
