import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/bank_logo.png" alt="ASUNova" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ASUNova
          </span>
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Login
          </Link>
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;