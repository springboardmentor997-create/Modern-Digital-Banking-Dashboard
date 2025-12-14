import React, { useState, useEffect } from 'react';
import { Building2, Zap, IndianRupee, PieChart, Bell, Gift, DollarSign, ArrowRight, Star, TrendingUp, Wallet, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Wallet,
      title: 'Multi-Account Overview',
      description: 'View all your accounts in one place with real-time balance updates'
    },
    {
      icon: TrendingUp,
      title: 'Transaction Feeds',
      description: 'Track every transaction with detailed categorization and history'
    },
    {
      icon: PieChart,
      title: 'Smart Budgeting',
      description: 'Set monthly budgets and get insights on your spending patterns'
    },
    {
      icon: Bell,
      title: 'Bill Reminders',
      description: 'Never miss a payment with automated reminders and workflows'
    },
    {
      icon: Gift,
      title: 'Rewards Tracking',
      description: 'Earn cashback and rewards on every transaction you make'
    },
    {
      icon: DollarSign,
      title: 'Currency Conversion',
      description: 'Convert currencies instantly with live exchange rates'
    }
  ];

  const benefits = [
    { number: '2.5M+', label: 'Active Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' },
    { number: '0', label: 'Monthly Fee' }
  ];

  const Feedback = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      comment: 'Tivra Bank has made managing my business finances so much easier. The budget tracking is incredible!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Freelancer',
      comment: 'Best banking app I have used. The rewards system and currency converter are game-changers.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      comment: 'Perfect for students! The bill reminders help me stay on top of my subscriptions.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 py-20 px-4 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                All-in-One Banking Hub
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Your Complete
                <span className="text-blue-600"> Financial Hub</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Manage accounts, track transactions, create budgets, pay bills, earn rewards, and convert currencies - all in one powerful platform.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                Open Free Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative overflow:hidden">
              <Carousel />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {benefits.map((benefit, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-blue-400 mb-2">{benefit.number}</div>
                <div className="text-gray-400">{benefit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to simplify your financial life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Open your account and start banking smarter today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up Free</h3>
              <p className="text-gray-600">Create your account in just 2 minutes with basic information</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Accounts</h3>
              <p className="text-gray-600">Link your existing accounts or open new ones instantly</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Banking</h3>
              <p className="text-gray-600">Access all features and take control of your finances</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="Feedback" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Feedback.map((testimonial, i) => (
              <div key={i} className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.comment}</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Open your free Tivra Bank account today and experience smarter banking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 text-lg transition-colors"
            >
              Create Free Account
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 text-lg transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is Tivra Bank really free?</h3>
              <p className="text-gray-600">Yes! Opening an account and using basic features is completely free with no monthly fees.</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How secure is my money?</h3>
              <p className="text-gray-600">We use bank-level 256-bit encryption and multi-factor authentication to protect your accounts.</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I link multiple accounts?</h3>
              <p className="text-gray-600">Yes! You can link and manage unlimited accounts from different banks in one place.</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How do rewards work?</h3>
              <p className="text-gray-600">Earn cashback on eligible transactions. Points accumulate automatically and can be redeemed for rewards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}