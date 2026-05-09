import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuditResult } from './auditEngine';

export interface AuditData {
  results: AuditResult[];
  totalSavings: number;
  annualSavings: number;
}

export async function exportToPDF(auditData: AuditData, summary?: string): Promise<void> {
  try {
    console.log('Starting PDF export...');
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up fonts and colors
    pdf.setFont('helvetica');
    const primaryColor = [59, 130, 246]; // blue-600
    const textColor = [30, 41, 59]; // slate-800
    
    let yPosition = 20;
    const margin = 20;
    const lineHeight = 7;
    
    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };
    
    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('AI Spend Audit Report', margin, yPosition);
    yPosition += 15;
    
    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;
    
    // Summary Section
    checkNewPage(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const totalSavingsText = `Total Monthly Savings: $${auditData.totalSavings.toFixed(2)}`;
    const annualSavingsText = `Total Annual Savings: $${auditData.annualSavings.toFixed(2)}`;
    const toolsCountText = `Tools Analyzed: ${auditData.results.length}`;
    
    pdf.text(totalSavingsText, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(annualSavingsText, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(toolsCountText, margin, yPosition);
    yPosition += 15;
    
    // AI Summary (if available)
    if (summary) {
      checkNewPage(40);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Insights', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Split long text into lines
      const lines = pdf.splitTextToSize(summary, pageWidth - 2 * margin);
      for (const line of lines) {
        checkNewPage(lineHeight);
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 10;
    }
    
    // Detailed Results
    checkNewPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', margin, yPosition);
    yPosition += 10;
    
    // Process each tool
    auditData.results.forEach((tool, index) => {
      checkNewPage(50);
      
      // Tool header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      const toolName = tool.name === 'chatgpt' ? 'ChatGPT' : 
                       tool.name === 'copilot' ? 'GitHub Copilot' :
                       tool.name === 'openai-api' ? 'OpenAI API' :
                       tool.name === 'anthropic-api' ? 'Anthropic API' :
                       tool.name.charAt(0).toUpperCase() + tool.name.slice(1);
      
      pdf.text(`${index + 1}. ${toolName}`, margin, yPosition);
      yPosition += 8;
      
      // Tool details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const details = [
        `Current Plan: ${tool.currentPlan.charAt(0).toUpperCase() + tool.currentPlan.slice(1)}`,
        `Current Spend: $${tool.currentSpend.toFixed(2)}/month`,
        `Seats: ${tool.seats}`,
        `Potential Savings: $${tool.savings.toFixed(2)}/month`
      ];
      
      details.forEach(detail => {
        pdf.text(detail, margin + 5, yPosition);
        yPosition += lineHeight;
      });
      
      // Recommendation
      if (tool.recommendation) {
        yPosition += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommendation:', margin + 5, yPosition);
        yPosition += lineHeight;
        pdf.setFont('helvetica', 'normal');
        
        const recLines = pdf.splitTextToSize(tool.recommendation, pageWidth - 2 * margin - 10);
        recLines.forEach((line: string) => {
          checkNewPage(lineHeight);
          pdf.text(line, margin + 10, yPosition);
          yPosition += lineHeight;
        });
      }
      
      yPosition += 8;
    });
    
    // Footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      pdf.text('Generated by AI Spend Audit Tool', margin, pageHeight - 10);
    }
    
    // Save the PDF
    const fileName = `ai-spend-audit-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF exported successfully:', fileName);
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

export async function exportResultsToPDF(elementId: string, fileName?: string): Promise<void> {
  try {
    console.log('Exporting element to PDF:', elementId);
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }
    
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save PDF
    const defaultFileName = `audit-results-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName || defaultFileName);
    
    console.log('Element PDF exported successfully');
    
  } catch (error) {
    console.error('Error exporting element to PDF:', error);
    throw new Error('Failed to export element to PDF. Please try again.');
  }
}
