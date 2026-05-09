// Result page (dynamic route)
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFromStorage } from "@/utils/storage";
import { runAudit, AuditResult } from "@/lib/auditEngine";
import { generateSummary } from "@/lib/summaryService";
import { saveAuditResults, getPublicAudit, getPrivateAudit, makeAuditPublic } from "@/lib/auditShare";
import { exportToPDF, exportResultsToPDF } from "@/lib/pdfExport";

interface ToolData {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

interface AuditData {
  results: AuditResult[];
  totalSavings: number;
  annualSavings: number;
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

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [summarySource, setSummarySource] = useState<'ai' | 'fallback'>('fallback');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditId, setAuditId] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const id = params.id as string;
        
        // Check if this is a shared audit URL
        if (id && id !== 'demo') {
          setLoading(true);
          const publicAudit = await getPublicAudit(id);
          
          if (publicAudit) {
            // Load shared audit
            const auditData = {
              results: publicAudit.tools,
              totalSavings: publicAudit.totalSavings,
              annualSavings: publicAudit.annualSavings,
            };
            setData(auditData);
            setAuditId(publicAudit.id);
            setIsPublic(true);
            setLoading(false);
            
            // Generate summary for shared audit
            setSummaryLoading(true);
            try {
              const summaryData = await generateSummary(auditData);
              setSummary(summaryData.summary);
              setSummarySource(summaryData.source);
            } catch (error) {
              console.error('Failed to generate summary:', error);
            } finally {
              setSummaryLoading(false);
            }
            return;
          }
        }
        
        // Load local audit from storage
        const stored = getFromStorage() as ToolData[];
        if (stored) {
          setTimeout(async () => {
            const result = runAudit(stored);
            setData(result);
            setLoading(false);
            
            // Save audit and get ID
            const savedId = await saveAuditResults(result);
            if (savedId) {
              setAuditId(savedId);
            }
            
            // Generate AI summary
            setSummaryLoading(true);
            try {
              const summaryData = await generateSummary(result);
              setSummary(summaryData.summary);
              setSummarySource(summaryData.source);
            } catch (error) {
              console.error('Failed to generate summary:', error);
            } finally {
              setSummaryLoading(false);
            }
          }, 1500);
        } else {
          setError('No audit data found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading audit:', error);
        setError('Failed to load audit results');
        setLoading(false);
      }
    };
    
    loadAudit();
  }, [params.id]);

  const handleShareAudit = async () => {
    setShareLoading(true);
    try {
      // Ensure we have audit data
      if (!data) {
        alert('No audit data available. Please complete an audit first.');
        return;
      }
      
      // If no auditId, try to save the audit first
      let currentAuditId = auditId;
      if (!currentAuditId) {
        console.log('No audit ID found, saving audit first...');
        const savedId = await saveAuditResults(data);
        if (savedId) {
          setAuditId(savedId);
          currentAuditId = savedId;
          console.log('Audit saved with ID:', savedId);
        } else {
          console.log('Failed to save audit, using localStorage fallback');
          // Generate a fallback ID for localStorage
          currentAuditId = 'local-' + Date.now();
          setAuditId(currentAuditId);
        }
      }
      
      if (!currentAuditId) {
        alert('Failed to create audit ID. Please try again.');
        return;
      }
      
      console.log('Making audit public:', currentAuditId);
      const success = await makeAuditPublic(currentAuditId);
      console.log('Make audit public result:', success);
      
      if (success) {
        setIsPublic(true);
        // Copy share URL to clipboard
        const shareUrl = `${window.location.origin}/result/${currentAuditId}`;
        console.log('Copying share URL:', shareUrl);
        
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert(`Share link copied to clipboard!\n\n${shareUrl}`);
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert(`Share link created!\n\nCopy this URL:\n${shareUrl}`);
        }
      } else {
        console.error('makeAuditPublic returned false');
        alert('Failed to create share link. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing audit:', error);
      alert(`Failed to create share link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShareLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!data) {
      alert('No audit data available to export');
      return;
    }
    
    setPdfLoading(true);
    try {
      console.log('Exporting PDF with data:', data);
      await exportToPDF(data, summary);
      console.log('PDF export successful');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Analyzing your AI spending...</h2>
          <p className="text-slate-500">Finding optimization opportunities</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {error || 'Audit not found'}
          </h2>
          <p className="text-slate-500 mb-6">
            {isPublic ? 'This shared audit may have been removed or is no longer public.' : 'Please start a new audit to see your results.'}
          </p>
          <button
            onClick={() => router.push('/audit')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  const totalCurrentSpend = data.results.reduce((sum, tool) => sum + tool.currentSpend, 0);
  const optimizedSpend = totalCurrentSpend - data.totalSavings;
  const savingsPercentage = totalCurrentSpend > 0 ? (data.totalSavings / totalCurrentSpend) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/audit'}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Audit Results</h1>
                <p className="text-slate-500">Your personalized AI spending optimization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Savings Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
              <div className="w-2 h-2 bg-emerald-300 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold text-white">Optimization Analysis Complete</span>
            </div>
            
            <div className="mb-10">
              <div className="text-6xl md:text-8xl font-black text-white mb-3 tracking-tight">
                ${data.totalSavings.toFixed(0)}
              </div>
              <div className="text-2xl text-emerald-100 font-medium">
                Monthly Savings • ${data.annualSavings.toFixed(0)} Annual
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-black text-white mb-2">{savingsPercentage.toFixed(0)}%</div>
                <div className="text-emerald-100 font-medium">Cost Reduction</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-black text-white mb-2">${totalCurrentSpend.toFixed(0)}</div>
                <div className="text-emerald-100 font-medium">Current Spend</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-black text-white mb-2">${optimizedSpend.toFixed(0)}</div>
                <div className="text-emerald-100 font-medium">Optimized Spend</div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Per-Tool Analysis</h2>
            
            {data.results.map((item, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  item.savings > 0 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Status indicator */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${
                  item.savings > 0 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></div>
                
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                        item.savings > 0 ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {toolIcons[item.name] || '🔧'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {item.name === 'chatgpt' ? 'ChatGPT' : 
                           item.name === 'copilot' ? 'GitHub Copilot' :
                           item.name === 'openai-api' ? 'OpenAI API' :
                           item.name === 'anthropic-api' ? 'Anthropic API' :
                           item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          {item.currentPlan.charAt(0).toUpperCase() + item.currentPlan.slice(1)} • {item.seats} seat{item.seats > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Current</div>
                      <div className="text-2xl font-black text-slate-900">${item.currentSpend.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">per month</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {item.savings > 0 ? (
                          <>
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-bold text-emerald-700 text-sm uppercase tracking-wide">Optimization Available</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="font-bold text-blue-700 text-sm uppercase tracking-wide">Optimal Configuration</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{item.reason}</p>
                      
                      {item.savings > 0 && (
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-2xl inline-block shadow-md hover:shadow-lg transition-shadow">
                          <span className="font-bold text-sm">{item.recommendation}</span>
                        </div>
                      )}
                      
                      {item.savings === 0 && (
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-2xl inline-block shadow-md hover:shadow-lg transition-shadow">
                          <span className="font-bold text-sm">{item.recommendation}</span>
                        </div>
                      )}
                    </div>
                    
                    {item.savings > 0 && (
                      <div className="text-right ml-6 pl-6 border-l border-slate-200">
                        <div className="text-3xl font-black text-emerald-600 mb-1">-${item.savings.toFixed(2)}</div>
                        <div className="text-sm font-semibold text-emerald-600">monthly savings</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
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
                  <span className="text-slate-600 font-medium">Tools Analyzed</span>
                  <span className="font-bold text-slate-900 text-lg">{data.results.length}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Optimizations Found</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {data.results.filter(r => r.savings > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Potential Savings</span>
                  <span className="font-black text-emerald-600 text-2xl">${data.totalSavings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Next Steps</h3>
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="font-medium">Review your team's actual usage of each tool</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span className="font-medium">Contact account managers for enterprise discounts</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="font-medium">Consider annual billing for additional savings</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <span className="font-medium">Set up quarterly spending reviews</span>
                </li>
              </ul>
            </div>

            {/* Share Results */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Share Results</h3>
              </div>
              
              {!isPublic ? (
                <div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Create a shareable link to show these results to your team or stakeholders
                  </p>
                  <button
                    onClick={handleShareAudit}
                    disabled={shareLoading || !auditId}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {shareLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Share Link...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Create Share Link
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                          <span className="ml-2 text-xs opacity-75">
                            (ID: {auditId || 'none'})
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-800 font-medium text-sm">This audit is publicly shareable</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                    <p className="text-xs text-slate-500 mb-2">Share URL:</p>
                    <p className="text-sm text-slate-700 font-mono break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/result/${auditId}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleShareAudit}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    Copy Link Again
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button 
                  onClick={handleExportPDF}
                  disabled={pdfLoading || !data}
                  className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {pdfLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    'Export Summary PDF'
                  )}
                </button>
              </div>
            </div>

            {/* AI Summary */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-xl">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-3">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">AI Insights</h3>
                  </div>
                  {summarySource === 'ai' && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-white">AI Powered</span>
                    </div>
                  )}
                  {summarySource === 'fallback' && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                      <span className="text-xs font-semibold text-white">Generated</span>
                    </div>
                  )}
                </div>
                
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    <span className="text-white font-medium">Analyzing your data...</span>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-white/20">
                      <p className="text-white leading-relaxed text-sm">
                        {summary}
                      </p>
                    </div>
                    {summarySource === 'ai' && (
                      <div className="flex items-center text-white/70 text-xs">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Powered by OpenAI GPT-3.5
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

        {/* Bottom CTA */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold text-white">Take Action Today</span>
            </div>
            
            <h3 className="text-4xl font-black text-white mb-6">
              Ready to Implement These Savings?
            </h3>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start by contacting your tool providers or exploring the recommended alternatives. Most changes can be implemented within your current billing cycle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => window.location.href = '/audit'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Run Another Audit
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 border border-white/20">
                Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}