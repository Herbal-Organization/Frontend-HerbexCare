import React from "react";
import {MdPhotoCamera} from "react-icons/md";
import {FaShareAltSquare} from "react-icons/fa";
import {GrLanguage} from "react-icons/gr";

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
                <img
                  src="https://www.svgrepo.com/show/312326/herb.svg"
                  alt="Herb Logo"
                  className="w-6 h-6"
                />
              </div>
              <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
                Herbal Care
              </h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
              Combining centuries-old botanical wisdom with cutting-edge artificial intelligence to empower your natural wellness journey.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-light/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <FaShareAltSquare className="text-sm" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-light/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <MdPhotoCamera  className="text-sm"/>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 tracking-tight">Explore</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Browse Recipes</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Botanical Database</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Safety Guides</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 tracking-tight">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Our Process</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Contact Support</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Affiliates</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 tracking-tight">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Medical Disclaimer</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Karim Safan. All rights reserved.
          </p>
          <div className="flex items-center text-slate-400 text-xs gap-1 cursor-pointer hover:text-slate-600 transition-colors">
            <GrLanguage className="text-lg" />
            English (US)
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
