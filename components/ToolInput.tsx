// ToolInput component
"use client";

import { useState } from "react";

interface ToolData {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

interface ToolInputProps {
  onAdd: (tool: ToolData) => void;
}

const tools = [
  { value: 'chatgpt', label: 'ChatGPT', icon: '💬' },
  { value: 'claude', label: 'Claude', icon: '🤖' },
  { value: 'copilot', label: 'GitHub Copilot', icon: '⚡' },
  { value: 'gemini', label: 'Gemini', icon: '✨' },
  { value: 'cursor', label: 'Cursor', icon: '🎯' },
  { value: 'openai-api', label: 'OpenAI API', icon: '🔌' },
  { value: 'anthropic-api', label: 'Anthropic API', icon: '🔗' },
];

const plans = {
  chatgpt: ['plus', 'team', 'enterprise', 'api'],
  claude: ['pro', 'team', 'enterprise', 'api'],
  copilot: ['individual', 'business', 'enterprise'],
  gemini: ['pro', 'advanced', 'ultra', 'api'],
  cursor: ['pro', 'business'],
  'openai-api': ['api'],
  'anthropic-api': ['api'],
};

export default function ToolInput({ onAdd }: ToolInputProps) {
  const [selectedTool, setSelectedTool] = useState('');
  const [plan, setPlan] = useState('');
  const [cost, setCost] = useState('');
  const [seats, setSeats] = useState('1');

  const handleAddTool = () => {
    if (!selectedTool || !plan || !cost) return;
    
    onAdd({
      name: selectedTool,
      plan,
      monthlySpend: parseFloat(cost),
      seats: parseInt(seats),
    });
    
    // Reset form
    setSelectedTool('');
    setPlan('');
    setCost('');
    setSeats('1');
  };

  const selectedToolData = tools.find(t => t.value === selectedTool);
  const availablePlans = selectedTool ? plans[selectedTool as keyof typeof plans] : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Add AI Tool</h3>
          <p className="text-sm text-slate-500">Enter your current AI tool subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            AI Tool
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.value}
                onClick={() => setSelectedTool(tool.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTool === tool.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-2">{tool.icon}</span>
                  <span className="font-medium text-slate-900 text-sm">{tool.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Plan
          </label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            disabled={!selectedTool}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select plan</option>
            {availablePlans.map((planOption) => (
              <option key={planOption} value={planOption}>
                {planOption.charAt(0).toUpperCase() + planOption.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Cost */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Monthly Cost ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Number of Seats */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of Seats
          </label>
          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            min="1"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddTool}
        disabled={!selectedTool || !plan || !cost}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Tool
      </button>
    </div>
  );
}