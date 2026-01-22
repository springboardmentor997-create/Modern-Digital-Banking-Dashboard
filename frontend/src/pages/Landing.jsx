import { useState } from 'react';
import { ArrowRight, Shield, CreditCard, TrendingUp, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [email, setEmail] = useState('');

  const features = [
    { icon: Shield, title: 'Secure Banking', desc: 'Bank-grade security with 256-bit encryption' },
    { icon: CreditCard, title: 'Smart Payments', desc: 'Instant transfers and bill payments' },
    { icon: TrendingUp, title: 'Investment Tools', desc: 'Track and grow your wealth' },
    { icon: Users, title: '24/7 Support', desc: 'Round-the-clock customer assistance' }
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Business Owner', text: 'Best banking app I\'ve ever used. Simple and powerful.' },
    { name: 'Mike Chen', role: 'Freelancer', text: 'Managing finances has never been this easy.' },
    { name: 'Emma Davis', role: 'Student', text: 'Perfect for tracking my budget and expenses.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-100 via-blue-50 to-purple-100 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/bank_logo.png" alt="ASUNova" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ASUNova
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Modern Banking
            </span>
            <br />
            <span className="text-gray-800">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the future of banking with our secure, intuitive platform. 
            Manage accounts, track expenses, and grow your wealth all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2">
              Start Banking Today <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="border-2 border-blue-200 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">50K+</h3>
              <p className="text-blue-100">Active Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">₹100Cr+</h3>
              <p className="text-blue-100">Transactions Processed</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">99.9%</h3>
              <p className="text-blue-100">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Transform Your Banking?
          </h2>
          <p className="text-gray-600 mb-8">Join thousands of users who trust us with their financial future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/bank_logo.png" alt="ASUNova" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold">ASUNova</span>
              </div>
              <p className="text-gray-400">Modern banking for the digital age.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Accounts</li>
                <li>Payments</li>
                <li>Investments</li>
                <li>Loans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Security</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ASUNova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
