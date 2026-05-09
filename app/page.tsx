// Landing page
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Spend Audit</span>
            </div>
            <Link
              href="/audit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Audit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-10 border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-blue-700 font-semibold text-sm">Save up to 70% on AI tools</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            Optimize Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Tool</span><br />
            Spending
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
            Get personalized recommendations to reduce your AI subscription costs. 
            Our audit analyzes your current spending and identifies optimization opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/audit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Free Audit
            </Link>
            <button 
              onClick={() => router.push('/audit')}
              className="bg-white text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-200"
            >
              View Demo
            </button>
          </div>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl font-black text-slate-900 mb-3">$2.5M+</div>
            <div className="text-slate-600 font-medium">Saved by users</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl font-black text-slate-900 mb-3">10K+</div>
            <div className="text-slate-600 font-medium">Audits completed</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl font-black text-slate-900 mb-3">500+</div>
            <div className="text-slate-600 font-medium">Companies optimized</div>
          </div>
        </div>

      {/* Features Grid */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-6">
              Everything you need to optimize AI spending
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              Powerful features to help you save money on AI tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analysis</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Our AI analyzes your spending patterns and identifies optimization opportunities you might have missed.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Cost Savings</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Get specific recommendations to reduce your monthly AI tool costs by up to 70%.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Detailed Reports</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Comprehensive reports with actionable insights and implementation steps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to optimize your AI spending?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of teams saving money on AI tools every month
          </p>
          <button
            onClick={() => router.push("/audit")}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-lg shadow-lg"
          >
            Start Your Free Audit
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
              <span className="text-slate-900 font-semibold">AI Spend Audit</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 AI Spend Audit. Save smarter, not harder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
