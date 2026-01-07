import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Lock, ShieldCheck, FileText } from 'lucide-react';

export default function Services() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);
  }, []);

  const services = [
    {
      id: 1,
      icon: CreditCard,
      title: 'Personal Accounts',
      description: 'Manage your savings and checking accounts with flexible terms.',
      features: ['Zero maintenance fee', 'Instant fund transfers', 'Digital wallet integration'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      icon: Smartphone,
      title: 'Mobile Banking',
      description: 'Banking at your fingertips with our secure mobile app.',
      features: ['Real-time notifications', 'Biometric security', 'Easy to use'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 3,
      icon: Lock,
      title: 'Secure Transfers',
      description: 'Transfer money safely with advanced encryption technology.',
      features: ['256-bit SSL encryption', 'Two-factor authentication', 'Fraud detection'],
      color: 'from-red-500 to-red-600'
    }
  ];

  const privacyPoints = [
    {
      icon: ShieldCheck,
      title: "Data Protection",
      desc: "Your personal and financial data is encrypted and securely stored using industry standards."
    },
    {
      icon: Lock,
      title: "No Data Sharing",
      desc: "We never sell or share your data with third parties without your consent."
    },
    {
      icon: FileText,
      title: "Transparent Policies",
      desc: "Our privacy policies clearly explain how your data is collected and used."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">
            Comprehensive banking solutions tailored to your financial needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`h-32 bg-gradient-to-r ${service.color} flex items-end justify-center pb-6`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>

                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 rounded-lg bg-gradient-to-r ${service.color} text-white font-semibold hover:shadow-lg`}>
                    Learn More
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h2>
            <p className="text-gray-600 text-lg">
              Your trust matters. We prioritize your privacy and data protection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {privacyPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Secure, simple, and smart banking at your fingertips.
          </p>
          <button
            onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Get Started
          </button>
        </div>

      </div>
    </div>
  );
}
