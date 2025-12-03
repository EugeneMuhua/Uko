
import React, { useState } from 'react';
import { X, CheckCircle, Loader2, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  partyTitle: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ partyTitle, amount, onSuccess, onCancel }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'input' | 'processing' | 'success'>('input');

  const handlePay = () => {
    // Basic validation for demonstration (allow standard KE formats)
    if (phone.length < 9) return;
    
    setStatus('processing');
    
    // Simulate M-Pesa STK Push latency (2.5 seconds)
    setTimeout(() => {
        setStatus('success');
        // Auto-close and proceed after showing success state
        setTimeout(onSuccess, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white text-gray-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transform transition-all">
        
        {/* Header */}
        <div className="bg-[#43B02A] p-4 text-white flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center">
              <span className="mr-2">Lipa na M-PESA</span>
            </h3>
            <button onClick={onCancel} className="bg-white/20 rounded-full p-1 hover:bg-white/40 transition-colors">
              <X size={16}/>
            </button>
        </div>

        <div className="p-6 text-center">
            {status === 'input' && (
                <div className="animate-[fadeIn_0.3s]">
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Entry Fee for {partyTitle}</p>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">KES {amount}</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative group">
                            <Smartphone className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-[#43B02A] transition-colors" size={20} />
                            <input 
                                type="tel" 
                                placeholder="07XX XXX XXX" 
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g,''))} // Only allow numbers
                                className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 text-lg font-mono focus:border-[#43B02A] focus:ring-0 focus:outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={handlePay}
                            disabled={phone.length < 9}
                            className="w-full bg-[#43B02A] hover:bg-[#3aa025] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            Pay Now
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-5 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Secure STK Push
                    </p>
                </div>
            )}

            {status === 'processing' && (
                <div className="py-8 flex flex-col items-center animate-[fadeIn_0.3s]">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                      <Loader2 size={48} className="text-[#43B02A] animate-spin relative z-10" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Check your phone</h3>
                    <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Enter your M-Pesa PIN to complete the transaction.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-8 flex flex-col items-center animate-[scaleIn_0.3s_ease-out]">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-[#43B02A]" />
                    </div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-1">Payment Successful!</h3>
                    <p className="text-gray-500 text-sm">Access granted. Enjoy the vibe.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
