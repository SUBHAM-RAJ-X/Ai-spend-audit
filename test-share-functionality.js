// Test script to verify share functionality
// Run this in browser console on the result page

console.log('🧪 Testing Share Functionality...');

// Test 1: Check if audit data exists
const auditData = window.findReactComponent?.()?.state?.data;
if (auditData) {
  console.log('✅ Audit data found:', auditData);
} else {
  console.log('❌ No audit data found');
}

// Test 2: Check if audit ID exists
const auditId = window.findReactComponent?.()?.state?.auditId;
if (auditId) {
  console.log('✅ Audit ID found:', auditId);
} else {
  console.log('❌ No audit ID found');
}

// Test 3: Check localStorage
const storedAudits = Object.keys(localStorage).filter(key => key.startsWith('audit-'));
console.log('📁 Stored audits in localStorage:', storedAudits);

const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
console.log('🔗 Shared audits:', sharedAudits);

// Test 4: Test share button click
const shareButton = document.querySelector('button[data-testid="share-button"]') || 
                    Array.from(document.querySelectorAll('button')).find(btn => 
                      btn.textContent.includes('Create Share Link'));

if (shareButton) {
  console.log('✅ Share button found');
  console.log('🖱️ Try clicking the "Create Share Link" button manually');
} else {
  console.log('❌ Share button not found');
}

console.log('🔍 Check the browser console for detailed logs when clicking the share button');
