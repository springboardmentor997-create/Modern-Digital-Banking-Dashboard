import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap, TrendingUp, Smartphone, DollarSign, Lock } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

export default function Services() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading services...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

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
      icon: DollarSign,
      title: 'Loans & Credits',
      description: 'Get instant approval for personal loans, home loans, and business credits.',
      features: ['Fast approval process', 'Flexible repayment terms', 'Low interest rates'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Investment Plans',
      description: 'Build wealth with our curated investment and savings plans.',
      features: ['Mutual funds', 'Fixed deposits', 'Expert guidance'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      icon: Smartphone,
      title: 'Mobile Banking',
      description: 'Banking at your fingertips with our secure mobile app.',
      features: ['Real-time notifications', 'Biometric security', 'Offline balance check'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 5,
      icon: Lock,
      title: 'Secure Transfers',
      description: 'Transfer money safely with advanced encryption technology.',
      features: ['256-bit SSL encryption', 'Two-factor authentication', 'Fraud detection'],
      color: 'from-red-500 to-red-600'
    },
    {
      id: 6,
      icon: Zap,
      title: 'Quick Pay',
      description: 'Instant payments and bill settlements in seconds.',
      features: ['Instant transfers', 'Bill payment', 'QR code payments'],
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Comprehensive banking solutions tailored to your financial needs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className={`h-32 bg-gradient-to-r ${service.color} flex items-end justify-center pb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>

                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`}></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 rounded-lg bg-gradient-to-r ${service.color} text-white font-semibold hover:shadow-lg transition-shadow duration-300`}>
                    Learn More
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl mb-8 opacity-90">Choose your favorite service and begin your financial journey today</p>
          <button onClick = {() => isLoggedIn ? navigate('/DashBoard') : navigate('/login')}className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}