// Form page
"use client";

import { useState } from "react";
import ToolInput from "@/components/ToolInput";
import { saveToStorage } from "@/utils/storage";
import { useRouter } from "next/navigation";

interface ToolData {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

const toolIcons: { [key: string]: string } = {
  chatgpt: '💬',
  claude: '🤖',
  copilot: '⚡',
  gemini: '✨',
  cursor: '🎯',
  'openai-api': '🔌',
  'anthropic-api': '🔗',
};

export default function AuditPage() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const router = useRouter();

  const addTool = (tool: ToolData) => {
    setTools([...tools, tool]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (tools.length === 0) return;
    saveToStorage(tools);
    // Generate a unique ID for this audit session
    const auditId = 'audit-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
    router.push(`/result/${auditId}`);
  };

  const totalMonthlySpend = tools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900">AI Spend Audit</h1>
                <p className="text-slate-600 font-medium">Add your AI tool subscriptions to analyze spending</p>
              </div>
            </div>
            <div className="text-right bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-2xl border border-blue-100">
              <div className="text-sm font-semibold text-blue-700 mb-1">Current Monthly Spend</div>
              <div className="text-3xl font-black text-slate-900">${totalMonthlySpend.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <ToolInput onAdd={addTool} />
            
            {/* Tools List */}
            {tools.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your AI Tools</h3>
                <div className="space-y-3">
                  {tools.map((tool, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                          {toolIcons[tool.name] || '🔧'}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-slate-900 mb-1">
                            {tool.name === 'chatgpt' ? 'ChatGPT' : 
                             tool.name === 'copilot' ? 'GitHub Copilot' :
                             tool.name === 'openai-api' ? 'OpenAI API' :
                             tool.name === 'anthropic-api' ? 'Anthropic API' :
                             tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            {tool.plan.charAt(0).toUpperCase() + tool.plan.slice(1)} plan • {tool.seats} seat{tool.seats > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-xl text-slate-900">${tool.monthlySpend.toFixed(2)}</div>
                          <div className="text-sm font-medium text-slate-500">/month</div>
                        </div>
                        <button
                          onClick={() => removeTool(index)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Tips */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Audit Summary</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Tools added</span>
                  <span className="font-bold text-slate-900 text-lg">{tools.length}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Monthly spend</span>
                  <span className="font-bold text-slate-900 text-lg">${totalMonthlySpend.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Annual spend</span>
                  <span className="font-bold text-slate-900 text-lg">${(totalMonthlySpend * 12).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pro Tips</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="font-medium">Add all your AI tools for the most accurate analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span className="font-medium">Include your actual monthly cost, not just list price</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="font-medium">Count all team members who use each tool</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <span className="font-medium">API usage counts as a separate subscription</span>
                </li>
              </ul>
            </div>

            {/* Popular Tools */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">🔥 Popular Tools</h3>
              <div className="space-y-2">
                {['ChatGPT', 'Claude', 'GitHub Copilot', 'Gemini'].map((tool) => (
                  <div key={tool} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">{tool}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Most analyzed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {tools.length > 0 && (
          <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-black text-white mb-4">Ready to optimize your spending?</h3>
                <p className="text-slate-300 text-lg font-medium">Get personalized recommendations to save money on your AI tools</p>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center"
              >
                Run Audit
                <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}