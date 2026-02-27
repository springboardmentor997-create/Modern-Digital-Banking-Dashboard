import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Mail, Phone, MessageCircle, Send, CheckCircle, X, User, Bot } from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../api/client';
import { createSupportTicket, sendChatMessage } from '../api/support';

const Support = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await createSupportTicket(formData);
      console.log('Support ticket created:', response);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ subject: '', message: '', priority: 'medium', category: 'general' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const response = await sendChatMessage(chatInput, 'chat_' + Date.now());
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          message: response.reply || 'Thank you for your message. Our team will assist you shortly.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          message: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact our email support.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:urmilakshirsagar1945@gmail.com?subject=Banking Support Request&body=Hello, I need help with...';
  };

  const handlePhoneSupport = () => {
    window.location.href = 'tel:+1-555-123-4567';
  };

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'urmilakshirsagar1945@gmail.com',
      action: 'Send Email',
      handler: handleEmailSupport
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our support team',
      contact: '+1 (555) 123-4567',
      action: 'Call Now',
      handler: handlePhoneSupport
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available 24/7',
      action: 'Start Chat',
      handler: () => setShowLiveChat(true)
    }
  ];

  const faqItems = [
    {
      question: 'How do I add a new bank account?',
      answer: 'Go to the Accounts page and click "Add Account". Follow the secure connection process to link your bank.'
    },
    {
      question: 'Why are my transactions not updating?',
      answer: 'Transactions typically update within 24-48 hours. You can manually refresh by going to Transactions > Sync Now.'
    },
    {
      question: 'How do I set up budget alerts?',
      answer: 'Navigate to Budgets, select a category, and enable notifications. You can set custom thresholds for alerts.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes, we use bank-level encryption and never store your banking credentials. All data is encrypted in transit and at rest.'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <Navbar title="Support" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Support Request Submitted!
          </h2>
          <p className="text-green-700">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Support" />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          How can we help you?
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get the support you need for your financial management. Choose from multiple ways to reach us.
        </p>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <Icon className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 mb-3">
                {option.description}
              </p>
              <p className="text-sm font-medium text-gray-800 mb-4">
                {option.contact}
              </p>
              <button 
                onClick={option.handler}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {option.action}
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Send us a message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="What do you need help with?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="general">General Inquiry</option>
                <option value="account">Account Issues</option>
                <option value="transaction">Transaction Problems</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Questions</option>
                <option value="security">Security Concerns</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-medium text-gray-900 mb-2">
                  {item.question}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Live Chat Support</h3>
              <button
                onClick={() => setShowLiveChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-xs ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      {msg.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600" />}
                    </div>
                    <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-xs">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <Bot size={16} className="text-gray-600" />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleChatSend}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;