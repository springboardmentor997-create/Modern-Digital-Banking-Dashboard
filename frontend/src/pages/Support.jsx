import React, { useState, useEffect } from 'react';
import { Phone, Mail, ChevronDown } from 'lucide-react';

export default function Support() {
  const [activeFAQ, setActiveFAQ] = useState(0);

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'You can sign up using your email and mobile number.'
    },
    {
      question: 'How secure is my account and data?',
      answer: 'We use JWT-based authentication, encrypted APIs, and secure servers to protect your data. Your credentials are never shared.'
    },
    {
      question: 'Can I view my transaction history?',
      answer: 'Yes, you can view and filter all your transactions from the Transactions section, including credits and debits.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach out to our support team through the Help section or email us directly from your registered email address.'
    }
  ];


  const contactChannels = [
    {
      icon: Phone,
      title: 'Phone Support',
      value: '1-800-TIVRA-BANK',
      subtext: 'Available 24/7',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@tivrabanking.com',
      subtext: '24-hour response',
      color: 'from-green-500 to-green-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Customer Support</h1>
          <p className="text-xl text-gray-600">We're here to help you 24/7</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid gap-6 mb-12">
          {contactChannels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{channel.title}</h3>
                <p className="text-lg font-semibold text-blue-600 mb-1">{channel.value}</p>
                <p className="text-gray-600 text-sm">{channel.subtext}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg: gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setActiveFAQ(activeFAQ === idx ? -1 : idx)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                          activeFAQ === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeFAQ === idx && (
                      <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}