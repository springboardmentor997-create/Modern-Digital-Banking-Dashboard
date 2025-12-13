import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Smartphone, CreditCard, Wallet, Shield, Zap, TrendingUp } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Smart Mobile Banking",
    text: "Manage your finances anywhere, anytime with our powerful mobile app.",
    icon: Smartphone,
    color: "from-blue-500 to-cyan-400",
    features: ["24/7 Access", "Instant Updates", "Secure & Fast"]
  },
  {
    id: 2,
    title: "Instant Payments",
    text: "Send and receive money in seconds with zero fees.",
    icon: Zap,
    color: "from-purple-500 to-pink-400",
    features: ["Real-time Transfer", "No Hidden Fees", "Global Reach"]
  },
  {
    id: 3,
    title: "Premium Cards",
    text: "Experience modern banking with exclusive rewards and benefits.",
    icon: CreditCard,
    color: "from-green-500 to-teal-400",
    features: ["5% Cashback", "Travel Benefits", "Zero Annual Fee"]
  },
  {
    id: 4,
    title: "Digital Wallet",
    text: "Store all your cards securely and pay with just a tap.",
    icon: Wallet,
    color: "from-orange-500 to-yellow-400",
    features: ["Contactless Pay", "Multi-Currency", "Instant Checkout"]
  },
  {
    id: 5,
    title: "Bank-Grade Security",
    text: "Your money protected with advanced encryption and authentication.",
    icon: Shield,
    color: "from-red-500 to-pink-500",
    features: ["256-bit Encryption", " Login", "Fraud Protection"]
  }
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isHovered]);

  const goToPrevious = () => {
    setCurrent((current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrent((current + 1) % slides.length);
  };

  const CurrentIcon = slides[current].icon;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => {
            const SlideIcon = slide.icon;
            return (
              <div
                key={slide.id}
                className={`min-w-full bg-gradient-to-br ${slide.color} text-white p-12 md:p-16`}
              >
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl">
                        <SlideIcon className="w-10 h-10" />
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        {slide.title}
                      </h2>
                      
                      <p className="text-lg md:text-xl text-white/90">
                        {slide.text}
                      </p>

                      <div className="space-y-3">
                        {slide.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-white/90 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button className="mt-6 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105">
                        Learn More
                      </button>
                    </div>
        
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute top-1/2 left-3 -translate-y-1/2 w-12 h-12 bg-transparent backdrop-blur-md rounded-full flex items-center justify-center hover: transition-all hover:scale-110 z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={goToNext}
          className="absolute top-1/2 right-6 -translate-y-1/2 w-12 h-12 bg-background backdrop-blur-md rounded-full flex items-center justify-center hover: transition-all hover:scale-110 z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all ${
                current === index
                  ? "w-12 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/80"
              } rounded-full`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}