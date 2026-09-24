import React from "react";
import { AlertTriangle } from "lucide-react";

interface PosPopupProps {
  message: string;
  onClose: () => void;
}

const PosPopup: React.FC<PosPopupProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* Popup */}
    <div className="bg-white rounded-2xl w-full max-w-sm z-10 p-6 shadow-2xl animate-fade-in-up text-center">
      <AlertTriangle className="text-6xl text-rose-500 mx-auto mb-4" />

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Action Required
      </h3>

      <p className="text-slate-500 mb-6">{message}</p>

      <button
        onClick={onClose}
        className="w-full px-4 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all"
      >
        OK
      </button>
    </div>
  </div>
);

export default PosPopup;
