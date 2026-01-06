import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Mail, Clock, Star, ChevronDown, Send } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

export default function Support() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(0);
  const [message, setMessage] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      setLoading(false);
    }
  }, [navigate]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint
      // await axiosClient.post('/support/tickets', { subject: ticketSubject, message });
      setTicketSubject('');
      setMessage('');
      alert('Ticket submitted successfully!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Error submitting ticket');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading support...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your registered email. You\'ll receive a reset link within 5 minutes.'
    },
    {
      question: 'What are your transfer limits?',
      answer: 'Daily transfer limit is ₹5,00,000 for standard accounts. Premium members enjoy limits up to ₹50,00,000. Business accounts have custom limits.'
    },
    {
      question: 'How secure is my account?',
      answer: 'We use 256-bit SSL encryption, two-factor authentication, and advanced fraud detection systems. Your data is secured with the latest banking standards.'
    },
    {
      question: 'Can I schedule recurring transfers?',
      answer: 'Yes! You can set up automatic transfers for bills, loans, and savings goals. Manage all recurring transfers from the "Scheduled Payments" section.'
    },
    {
      question: 'How long does a transfer take?',
      answer: 'Most transfers are completed instantly. International transfers typically take 1-3 business days depending on the destination country.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support UPI, NEFT, RTGS, IMPS, and card payments. You can also set up standing instructions for recurring payments.'
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
    {
      icon: MessageSquare,
      title: 'Live Chat',
      value: 'Chat with us',
      subtext: 'Available Now',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: '2 minutes',
      subtext: 'Average',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Customer Support</h1>
          <p className="text-xl text-gray-600">We're here to help you 24/7</p>
        </div>

        {/* Contact Channels */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Submit Ticket */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Ticket</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your issue"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell us more details..."
                  />
                </div>
                <button
                  onClick={handleSubmitTicket}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
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

        {/* Support Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-sm font-medium mb-2">Customer Satisfaction</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-yellow-500">4.9</span>
              <span className="text-gray-600">/5</span>
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-sm font-medium mb-2">Avg Response Time</p>
            <p className="text-4xl font-bold text-blue-600 mb-2">2</p>
            <p className="text-gray-600">minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-sm font-medium mb-2">Resolution Rate</p>
            <p className="text-4xl font-bold text-green-600 mb-2">98%</p>
            <p className="text-gray-600">first contact</p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
              <p className="opacity-90 mb-6">Check out our comprehensive documentation and tutorials</p>
              <button className="px-6 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                View Documentation
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Community Forum</h3>
              <p className="opacity-90 mb-6">Connect with other users and share tips</p>
              <button className="px-6 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Join Forum
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}