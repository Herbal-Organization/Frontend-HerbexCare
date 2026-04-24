import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaReceipt, FaMapMarkerAlt, FaCreditCard, FaLeaf, FaFlask, FaSpinner, FaTimesCircle, FaCheckCircle, FaMoneyCheckAlt, FaExclamationCircle } from "react-icons/fa";
import { getOrderById, cancelOrder, simulatePayment } from "../../../api/orders";
import { toast } from "react-hot-toast";

function PatientOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isCanceling, setIsCanceling] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.title || "Unable to acquire the localized manifest at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm("Are you positive you wish to formally cancel this logistical dispatch?")) {
      return;
    }
    
    setIsCanceling(true);
    try {
      await cancelOrder(orderId);
      toast.success("Order sequence terminated effectively");
      await fetchOrderDetails(); // Reload state gracefully 
    } catch(err) {
      toast.error(err.response?.data?.message || err.response?.data?.title || "Termination failed.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      await simulatePayment(orderId);
      toast.success("Financial transaction simulated safely");
      await fetchOrderDetails(); 
    } catch(err) {
      toast.error(err.response?.data?.message || err.response?.data?.title || "Simulation interrupted randomly.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">Fetching Secure Manifest...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/patient/dashboard/orders" className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-2 mb-8 transition-colors">
          <FaArrowLeft /> Back to Log
        </Link>
        <div className="rounded-[3rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm">
           <FaExclamationCircle className="mx-auto text-5xl text-red-400 mb-6" />
           <h2 className="text-2xl font-bold text-red-800">Manifest Retrieval Fault</h2>
           <p className="mt-2 text-red-600 font-medium">{error || "Requested entity not found securely"}</p>
        </div>
      </div>
    );
  }

  const isCanceled = order.status?.toLowerCase().includes("cancel");
  const isPaid = order.status?.toLowerCase().includes("paid") || order.status?.toLowerCase().includes("complete") || order.status?.toLowerCase().includes("processed");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/patient/dashboard/orders" className="inline-flex text-sm font-bold text-slate-500 hover:text-emerald-600 items-center justify-center gap-2 mb-8 transition-colors bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2 hover:-translate-y-0.5">
        <FaArrowLeft /> Historical Index
      </Link>

      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-slate-600 shadow-inner">
               <FaReceipt className="text-xl" />
             </div>
             Manifest #{orderId.toString().substring(0, 8)}
           </h1>
           <p className="mt-3 text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
             Placed {new Date(order.orderDate || order.createdAt).toLocaleString()}
           </p>
        </div>
        
        <div className="flex items-center gap-3">
          {order.status && (
             <span className={`inline-flex px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border ${
               isCanceled ? "bg-rose-50 border-rose-200 text-rose-700" :
               isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
               "bg-amber-50 border-amber-200 text-amber-700"
             }`}>
               {order.status}
             </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              Dispatched Commodities
            </h2>

            {order.herbs && order.herbs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <FaLeaf /> Organic Herbs
                </h3>
                <div className="space-y-3">
                  {order.herbs.map((h, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                       <div>
                         <p className="font-bold text-slate-900">{h.herbName || `Secured Herb Identity #${h.herbId}`}</p>
                         <p className="text-xs text-slate-500 font-semibold mt-0.5">Sourced from Herbalist #{h.herbalistId}</p>
                       </div>
                       <div className="text-right flex flex-col justify-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white shadow-sm px-3 py-1 rounded-full border border-slate-200">
                            {h.quantityPerGram} grams extracted
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {order.recipes && order.recipes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <FaFlask /> Mixed Recipes
                </h3>
                <div className="space-y-3">
                  {order.recipes.map((r, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                       <div>
                         <p className="font-bold text-slate-900">{r.recipeName || `Compound Configuration #${r.recipeId}`}</p>
                       </div>
                       <div className="text-right flex flex-col justify-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white shadow-sm px-3 py-1 rounded-full border border-slate-200">
                            Quantity: {r.quantity}
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {((!order.herbs || order.herbs.length === 0) && (!order.recipes || order.recipes.length === 0)) && (
               <p className="text-sm text-slate-500 font-medium italic">Internal record yields zero explicit inventory bindings currently mapped.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              Routing Trace
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5 mb-2">
                  <FaMapMarkerAlt /> Target Location
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                   <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                     {order.shippingAddress || "N/A - Direct pickup configured"}
                   </p>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5 mb-2">
                  <FaCreditCard /> Financial Network
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                   <p className="text-sm font-bold text-slate-900">
                     {order.paymentMethod || "Untracked Configuration"}
                   </p>
                </div>
              </div>
            </div>
            
            {order.totalCost != null && order.totalCost > 0 && (
               <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-100 p-5 flex items-center justify-between">
                 <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Total Valuation</span>
                 <span className="text-xl font-black text-emerald-600">{order.totalCost} EGP</span>
               </div>
            )}
          </div>

          {/* Action Operations Area */}
          <div className="space-y-3">
             {!isCanceled && !isPaid && (
               <button
                 type="button"
                 onClick={handleCancel}
                 disabled={isCanceling}
                 className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-4 text-sm font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
               >
                 {isCanceling ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Terminal Revocation
               </button>
             )}
             
             {!isCanceled && !isPaid && (
               <button
                 type="button"
                 onClick={handleSimulatePayment}
                 disabled={isSimulating}
                 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
               >
                 {isSimulating ? <FaSpinner className="animate-spin" /> : <FaMoneyCheckAlt className="text-emerald-400" />} Initiate Mock Financial Trace 
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientOrderDetails;
