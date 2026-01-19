// script/import-scholarships.js
const fs = require('fs');
const { supabase } = require('../src/app/lib/supabase-admin.js');

// ==================== CONFIGURATION ====================
const JSON_FILE_PATH = './scholarships-data.json';  // Your scholarship JSON file path

// ==================== HELPER FUNCTIONS ====================
function cleanJsonData(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

function extractTextFromHtml(html) {
  if (!html) return '';
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHighlightValue(highlights, label) {
  if (!highlights || !Array.isArray(highlights)) return null;
  const item = highlights.find(h => h.label === label);
  return item ? item.value : null;
}

// ==================== MAIN IMPORT FUNCTION ====================
async function importScholarships() {
  try {
    console.log('🚀 Starting scholarship import...\n');

    // 1. Read and parse JSON file
    let fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    fileContent = fileContent.replace(/,(\s*[}\]])/g, '$1');
    
    let scholarshipsData = JSON.parse(fileContent);
    scholarshipsData = cleanJsonData(scholarshipsData);

    console.log(`✅ Found ${scholarshipsData.length} scholarships\n`);

    // 2. Test connection
    const { error: connectionError } = await supabase
      .from('scholarship_new')
      .select('id')
      .limit(1);

    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }

    console.log('✅ Database connection successful\n');

    // 3. Import each scholarship
    let success = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < scholarshipsData.length; i++) {
      const scholarship = scholarshipsData[i];
      const name = scholarship.scholarship_name || 'Unknown Scholarship';

      try {
        // Extract data from JSON structure
        const eligibilityText = extractTextFromHtml(
          scholarship.eligibility_criteria?.description || 
          scholarship.eligibility_criteria?.html_content || 
          ''
        );

        const applicationText = extractTextFromHtml(
          scholarship.application_process?.description || 
          scholarship.application_process?.html_content || 
          ''
        );

        const selectionText = extractTextFromHtml(
          scholarship.selection_process?.description || 
          scholarship.selection_process?.html_content || 
          ''
        );

        // Extract country from highlights or description
        let country = extractHighlightValue(scholarship.highlights, 'Country');
        if (!country && scholarship.description) {
          const descText = extractTextFromHtml(scholarship.description);
          if (descText.includes('Ontario') || descText.includes('Canada')) country = 'Canada';
          else if (descText.includes('UK') || descText.includes('United Kingdom')) country = 'UK';
          else if (descText.includes('USA') || descText.includes('United States')) country = 'USA';
          else if (descText.includes('Australia')) country = 'Australia';
          else if (descText.includes('Germany')) country = 'Germany';
          else if (descText.includes('France')) country = 'France';
        }

        // Extract provider/organization
        const provider = extractHighlightValue(scholarship.highlights, 'Organization') ||
                        extractHighlightValue(scholarship.highlights, 'Offered by') ||
                        null;

        // Extract deadline
        const deadline = extractHighlightValue(scholarship.highlights, 'Application Deadline') || 
                        'Check website';

        // Extract amount/price
        const amount = extractHighlightValue(scholarship.highlights, 'Amount');

        // Determine degree level from description
        let degreeLevel = '';
        const allText = (scholarship.description + ' ' + eligibilityText).toLowerCase();
        
        if (allText.includes('doctoral') || allText.includes('ph.d') || allText.includes('phd')) {
          degreeLevel = 'PhD';
        } else if (allText.includes('postgraduate') || allText.includes('graduate')) {
          degreeLevel = 'Postgraduate';
        } else if (allText.includes('master')) {
          degreeLevel = 'Master';
        } else if (allText.includes('undergraduate') || allText.includes('bachelor')) {
          degreeLevel = 'Undergraduate';
        }

        // Combine all eligibility information
        const detailedEligibility = [
          eligibilityText,
          applicationText ? `Application: ${applicationText}` : '',
          selectionText ? `Selection: ${selectionText}` : ''
        ].filter(Boolean).join(' | ').substring(0, 5000); // Limit length

        // Prepare data for insertion
        const insertData = {
          id: scholarship.id || null,
          scholarship_name: name,
          country_region: country || null,
          provider: provider,
          degree_level: degreeLevel || null,
          deadline: deadline,
          detailed_eligibility: detailedEligibility || null,
          link: scholarship.url || scholarship.final_url || null,
          price: amount || null
        };

        console.log(`📝 Inserting: ${name}`);

        const { data, error } = await supabase
          .from('scholarship_new')
          .insert(insertData)
          .select();

        if (error) {
          throw error;
        }

        success++;
        console.log(`✅ [${i + 1}/${scholarshipsData.length}] ${name}\n`);

      } catch (err) {
        failed++;
        const errorMsg = `${name}: ${err.message}`;
        errors.push(errorMsg);
        console.log(`❌ [${i + 1}/${scholarshipsData.length}] ${errorMsg}\n`);
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${success}`);
    console.log(`❌ Failed to import: ${failed}`);
    console.log(`📁 Total scholarships: ${scholarshipsData.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err}`);
      });
    }

    console.log('\n✨ Import completed!\n');

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error('\nStack trace:', err.stack);
    process.exit(1);
  }
}

// ==================== EXECUTE ====================
importScholarships()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });