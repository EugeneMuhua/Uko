import React, { useState } from 'react';
import { X, Users, CheckCircle, ChevronRight, ChevronLeft, Minus, Plus, Share2, CreditCard, Clock, Smartphone, Loader2 } from 'lucide-react';
import { Party } from '../types';

interface TableBookingModalProps {
  party: Party;
  onClose: () => void;
  onConfirm: (details: any) => void;
}

const TABLE_OPTIONS = [
  { id: 't1', name: 'High Table', seats: 2, minSpend: 3000, color: 'border-gray-600' },
  { id: 't2', name: 'Club Booth', seats: 4, minSpend: 10000, color: 'border-neon-blue' },
  { id: 't3', name: 'V.I.P Section', seats: 8, minSpend: 25000, color: 'border-neon-purple' },
];

const DRINK_MENU = [
  { id: 'd1', name: 'Hennessy VS', price: 8500, image: 'https://images.unsplash.com/photo-1619451328014-998858e8749a?auto=format&fit=crop&q=80&w=200' },
  { id: 'd2', name: 'Moët & Chandon', price: 12000, image: 'https://images.unsplash.com/photo-1598155523122-38423bd4d6bc?auto=format&fit=crop&q=80&w=200' },
  { id: 'd3', name: 'Cîroc Vodka', price: 6000, image: 'https://images.unsplash.com/photo-1608649983794-6d9b3d0728c7?auto=format&fit=crop&q=80&w=200' },
  { id: 'd4', name: 'Gilbeys Gin', price: 3500, image: 'https://images.unsplash.com/photo-1620027664875-10874bc9338b?auto=format&fit=crop&q=80&w=200' },
  { id: 'd5', name: 'Tequila Shots (6)', price: 2500, image: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=200' },
];

export const TableBookingModal: React.FC<TableBookingModalProps> = ({ party, onClose, onConfirm }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [duration, setDuration] = useState(3);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [splitCount, setSplitCount] = useState(1);
  
  // Payment State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const toggleDrink = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    const tableCost = TABLE_OPTIONS.find(t => t.id === selectedTable)?.minSpend || 0; 
    // Let's treat table price as a reservation fee/deposit for this mock (10% of min spend)
    const reservationFee = Number(tableCost) * 0.1; 
    
    let drinksTotal = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const drink = DRINK_MENU.find(d => d.id === id);
      if (drink) drinksTotal += Number(drink.price) * Number(qty);
    });

    return { reservationFee, drinksTotal, total: reservationFee + drinksTotal };
  };

  const { reservationFee, drinksTotal, total } = calculateTotal();
  const costPerPerson = Math.ceil(total / splitCount);

  const selectedTableName = TABLE_OPTIONS.find(t => t.id === selectedTable)?.name || 'Table';

  const handleNext = () => {
    if (step === 3) {
      if (phoneNumber.length < 9) return;
      
      setPaymentStatus('processing');
      // Simulate M-Pesa STK Push
      setTimeout(() => {
        setPaymentStatus('success');
        setTimeout(() => {
          onConfirm({ selectedTable, duration, cart, splitCount, total, phoneNumber });
        }, 2000);
      }, 3000);
    } else {
      setStep(prev => (prev + 1) as 1 | 2 | 3);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-gray-900 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl flex flex-col shadow-2xl border-t sm:border border-gray-800 animate-[slideUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/95 rounded-t-2xl z-10 sticky top-0">
          <div>
            <h2 className="text-white font-bold text-lg">Customize Experience</h2>
            <p className="text-xs text-neon-purple flex items-center">
              {step === 3 ? 'Confirm & Pay' : `Step ${step} of 3`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* STEP 1: SELECT TABLE */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-gray-400 text-sm">Choose your base for the night at <span className="text-white font-bold">{party.title}</span>.</p>
              
              {/* Duration Selector */}
              <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center">
                  <Clock className="text-neon-blue mr-3" size={20} />
                  <div>
                    <h3 className="text-white font-bold text-sm">Duration</h3>
                    <p className="text-gray-500 text-xs">How long are you staying?</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-1.5">
                  <button 
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-white font-bold min-w-[30px] text-center">{duration}h</span>
                  <button 
                    onClick={() => setDuration(Math.min(12, duration + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {TABLE_OPTIONS.map(table => {
                  const isSelected = selectedTable === table.id;
                  return (
                    <div 
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? `${table.color} bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                          : 'border-gray-800 hover:border-gray-700 bg-gray-800/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-white flex items-center">
                           {table.name}
                           {isSelected && <CheckCircle size={16} className="ml-2 text-neon-green" />}
                        </h3>
                        <span className="text-xs font-mono text-gray-400">Min: KES {table.minSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users size={14} className="mr-1" /> {table.seats} Seats
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DRINKS */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">Pre-order bottles to your table.</p>
                <span className="text-xs text-neon-green font-bold">Total: KES {drinksTotal.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {DRINK_MENU.map(drink => {
                  const qty = cart[drink.id] || 0;
                  return (
                    <div key={drink.id} className={`bg-gray-800 rounded-xl overflow-hidden border transition-colors ${qty > 0 ? 'border-neon-blue' : 'border-gray-700'}`}>
                      <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${drink.image})` }} />
                      <div className="p-3">
                        <h4 className="text-white font-bold text-sm truncate">{drink.name}</h4>
                        <p className="text-gray-400 text-xs mb-3">KES {drink.price.toLocaleString()}</p>
                        
                        {/* Persistent Stepper UI */}
                        <div className="flex items-center justify-between bg-black/40 rounded-lg p-1 mt-2">
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleDrink(drink.id, -1); }}
                              disabled={qty === 0}
                              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                                  qty === 0 
                                  ? 'text-gray-600 cursor-not-allowed' 
                                  : 'bg-gray-700 text-white hover:bg-gray-600 active:scale-95'
                              }`}
                           >
                             <Minus size={14} />
                           </button>
                           
                           <span className={`text-sm font-bold w-6 text-center ${qty > 0 ? 'text-white' : 'text-gray-500'}`}>
                              {qty}
                           </span>
                           
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleDrink(drink.id, 1); }}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-black transition-colors active:scale-95"
                           >
                             <Plus size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: COST SHARE / CONFIRMATION */}
          {step === 3 && paymentStatus === 'idle' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-neon-card border border-gray-700 rounded-xl p-4 shadow-lg">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-4 flex items-center">
                    <CheckCircle size={14} className="mr-2 text-neon-green" /> Confirmation Summary
                </h3>
                
                {/* Table Details */}
                <div className="flex justify-between text-sm text-gray-300 mb-2 pb-2 border-b border-gray-800">
                   <div className="flex flex-col">
                       <span className="text-white font-bold">{selectedTableName}</span>
                       <span className="text-xs text-gray-500">{duration} Hours Access</span>
                   </div>
                   <span className="font-bold text-white">KES {reservationFee.toLocaleString()}</span>
                </div>

                {/* Drink Details */}
                {Object.keys(cart).length > 0 ? (
                    <div className="space-y-2 mb-3">
                        {Object.entries(cart).map(([id, qty]) => {
                            const drink = DRINK_MENU.find(d => d.id === id);
                            if (!drink) return null;
                            return (
                                <div key={id} className="flex justify-between text-xs text-gray-400">
                                    <span>{qty}x {drink.name}</span>
                                    <span>KES {(Number(drink.price) * Number(qty)).toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-gray-500 italic mb-2">No drinks pre-ordered</div>
                )}

                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between text-lg font-bold text-white">
                   <span>Grand Total</span>
                   <span>KES {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Splitting Logic */}
              <div>
                <label className="text-white font-bold flex items-center mb-4">
                   <Users size={18} className="mr-2 text-neon-blue" /> Split Bill With Squad
                </label>
                
                <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between mb-4">
                   <button 
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                   >
                     <Minus size={18} />
                   </button>
                   <div className="text-center">
                     <span className="block text-2xl font-bold text-white">{splitCount}</span>
                     <span className="text-xs text-gray-400">People</span>
                   </div>
                   <button 
                      onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                      className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                   >
                     <Plus size={18} />
                   </button>
                </div>

                <div className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/50 rounded-xl p-4 text-center transform transition-all hover:scale-[1.02]">
                   <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider text-[10px]">Your Share</p>
                   <p className="text-3xl font-black text-white">KES {costPerPerson.toLocaleString()}</p>
                </div>
              </div>

              {/* M-Pesa Input */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3 flex items-center">
                    <Smartphone size={14} className="mr-2 text-[#43B02A]" /> M-Pesa Number
                </label>
                <div className="flex items-center bg-black/40 border border-gray-600 rounded-lg overflow-hidden focus-within:border-[#43B02A] transition-colors group">
                    <div className="bg-gray-700 px-3 py-3 text-gray-300 border-r border-gray-600 text-sm font-mono">+254</div>
                    <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g,''))}
                        placeholder="7XX XXX XXX"
                        className="flex-1 bg-transparent px-3 text-white focus:outline-none font-mono py-2"
                    />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Enter phone number to receive payment request.</p>
              </div>

              {splitCount > 1 && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-start space-x-2 text-xs text-blue-200">
                      <Share2 size={16} className="mt-0.5 flex-shrink-0" />
                      <p>A payment link will be generated for {splitCount - 1} other(s) after you confirm your share.</p>
                  </div>
              )}
            </div>
          )}

          {/* Payment Status Views */}
          {paymentStatus === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 animate-fadeIn text-center">
                  <div className="relative mb-6">
                      <div className="absolute inset-0 bg-[#43B02A] rounded-full animate-ping opacity-20"></div>
                      <div className="bg-gray-800 rounded-full p-6 relative z-10 border border-[#43B02A]/30">
                          <Loader2 size={48} className="text-[#43B02A] animate-spin" />
                      </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Check your phone</h3>
                  <p className="text-gray-400 text-sm max-w-[250px]">
                      A request has been sent to <span className="text-[#43B02A] font-mono">+254 {phoneNumber}</span>. 
                      Enter your M-Pesa PIN to complete booking.
                  </p>
              </div>
          )}

          {paymentStatus === 'success' && (
              <div className="flex flex-col items-center justify-center py-12 animate-fadeIn text-center">
                  <div className="bg-[#43B02A]/20 rounded-full p-6 mb-6 border border-[#43B02A]/50">
                      <CheckCircle size={64} className="text-[#43B02A]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h3>
                  <p className="text-gray-400 text-sm">Table booked successfully. See you there!</p>
              </div>
          )}
        </div>

        {/* Footer */}
        {paymentStatus === 'idle' && (
            <div className="p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10 flex gap-3">
            {step > 1 && (
                <button 
                onClick={() => setStep(prev => (prev - 1) as 1 | 2 | 3)}
                className="px-4 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition-colors"
                >
                <ChevronLeft size={20} />
                </button>
            )}
            <button 
                onClick={handleNext}
                disabled={(step === 1 && !selectedTable) || (step === 3 && phoneNumber.length < 9)}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                (step === 1 && !selectedTable) || (step === 3 && phoneNumber.length < 9)
                    ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                    : step === 3
                    ? 'bg-[#43B02A] hover:bg-[#3aa025] hover:shadow-[0_0_20px_rgba(67,176,42,0.4)]'
                    : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:shadow-[0_0_20px_#b026ff60] active:scale-95'
                }`}
            >
                {step === 3 ? (
                <span className="flex items-center"><CreditCard size={18} className="mr-2" /> Pay KES {costPerPerson.toLocaleString()}</span>
                ) : (
                <span className="flex items-center">Next <ChevronRight size={18} className="ml-1" /></span>
                )}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};