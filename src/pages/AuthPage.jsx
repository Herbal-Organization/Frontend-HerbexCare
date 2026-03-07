import React, { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../component/auth/Login";
import Register from "../component/auth/Register";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 bg-primary-light/50 relative overflow-hidden p-12">
        <img src="/auth_leaf_bg.png" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply" alt="Leaf Background" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary mb-6 shadow-sm hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">energy_savings_leaf</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Herbal Care AI</h1>
          <p className="text-slate-700 text-base max-w-sm leading-relaxed mb-12 font-medium">
            Harness the power of nature with AI-driven herbal wisdom for your daily wellness journey.
          </p>
          
          <div className="flex gap-2">
            <div className="w-8 h-1.5 bg-primary rounded-full tracking-indicator"></div>
            <div className="w-1.5 h-1.5 bg-primary/30 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-primary/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] relative z-20 w-full lg:w-7/12 overflow-y-auto">
        <div className="mx-auto w-full max-w-md lg:w-[28rem]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin ? 'Please enter your details to continue' : 'Join us to start your natural wellness journey'}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Create Account
              </button>
            </div>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-primary">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}

            <div className="mt-2">
              {isLogin ? (
                <Login setSuccessMsg={setSuccessMsg} />
              ) : (
                <Register setIsLogin={setIsLogin} setSuccessMsg={setSuccessMsg} />
              )}
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-slate-400 font-medium pb-8 lg:pb-0">
             <p>&copy; {new Date().getFullYear()} Herbal Care AI. All rights reserved.</p>
             <div className="flex justify-center gap-3 mt-3">
               <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
               <span>•</span>
               <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
