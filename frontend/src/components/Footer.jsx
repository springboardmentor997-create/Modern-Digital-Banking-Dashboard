import React from "react";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const goToSignup = (role) => {
    navigate("/login", { state: { role } });
  };

    return(
      <footer className="py-12 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8 mb-8 md:grid-cols-4 gap-8 mb-8">
            <div className="flex-col items-center justify-center text-center" >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Tivra Bank</span>
              </div>
              <p className="text-sm">Your complete financial hub</p>
            </div>
            <div className="flex-col items-center justify-center text-center"> 
              <h4 className="text-white font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div className="flex-col items-center justify-center text-center">
              <h4 className="text-white font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><button onClick={() => goToSignup("user")}>Don't have an account</button></li>
                <li><button onClick={() => goToSignup("admin")}>Admin here</button></li>
                <li><button onClick={() => goToSignup("Auditor")}>Auditor here</button></li>
              </ul>
            </div>
            <div className="flex-col items-center justify-center text-center">
              <h4 className="text-white font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm pt-10 ">
            © 2024 Tivra Bank. All rights reserved.
          </div>
        </div>
      </footer>
    );
}
