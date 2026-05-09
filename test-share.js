// Test script for share functionality
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('Could not read .env.local file:', error.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testShareFunctionality() {
  console.log('Testing share functionality...');
  
  try {
    // Test 1: Create a sample audit
    const sampleAudit = {
      id: 'test-' + Date.now(),
      tools: [
        {
          name: 'chatgpt',
          currentPlan: 'plus',
          currentSpend: 25,
          seats: 1,
          recommendation: 'Keep current plan',
          savings: 0,
          reason: 'Good value for money',
          recommendations: []
        }
      ],
      total_savings: 0,
      annual_savings: 0,
      is_public: false,
      created_at: new Date().toISOString()
    };
    
    console.log('Creating sample audit...');
    const { data: insertData, error: insertError } = await supabase
      .from('audits')
      .insert(sampleAudit)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Failed to create audit:', insertError);
      return;
    }
    
    console.log('✅ Sample audit created:', insertData.id);
    
    // Test 2: Make audit public
    console.log('Making audit public...');
    const { data: updateData, error: updateError } = await supabase
      .from('audits')
      .update({ is_public: true })
      .eq('id', insertData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Failed to make audit public:', updateError);
      return;
    }
    
    console.log('✅ Audit made public:', updateData.id);
    
    // Test 3: Retrieve public audit
    console.log('Retrieving public audit...');
    const { data: publicData, error: publicError } = await supabase
      .from('audits')
      .select('id, tools, total_savings, annual_savings, created_at')
      .eq('id', insertData.id)
      .eq('is_public', true)
      .single();
    
    if (publicError) {
      console.error('❌ Failed to retrieve public audit:', publicError);
      return;
    }
    
    console.log('✅ Public audit retrieved successfully');
    console.log('📊 Audit data:', {
      id: publicData.id,
      toolsCount: publicData.tools.length,
      totalSavings: publicData.total_savings,
      annualSavings: publicData.annual_savings
    });
    
    // Test 4: Generate share URL
    const shareUrl = `http://localhost:3001/result/${insertData.id}`;
    console.log('🔗 Share URL:', shareUrl);
    
    // Clean up
    await supabase.from('audits').delete().eq('id', insertData.id);
    console.log('🧹 Test audit cleaned up');
    
    console.log('\n✅ All share functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testShareFunctionality();
