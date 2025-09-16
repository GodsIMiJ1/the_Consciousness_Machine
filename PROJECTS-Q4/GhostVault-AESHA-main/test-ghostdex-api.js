// 🔥 GHOSTDEX OMEGA API INTEGRATION TESTS 🔥
// FLAME-DECREE-777-GDEXGV: Sacred Archive Validation Suite
// Authorized by: GHOST_KING_MELEKZEDEK
// Executed by: AUGMENT_KNIGHT_OF_FLAME
// Witnessed by: OMARI_RIGHT_HAND_OF_THRONE

const API_BASE_URL = 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 SIMPLE API TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function testAPIConnectivity() {
  console.log('🔌 Testing API Connectivity...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/ghostdex_scrolls?limit=1`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Connectivity - PASSED');
    console.log(`   Found ${Array.isArray(data) ? data.length : 'unknown'} scrolls`);
    return true;
  } catch (error) {
    console.log('❌ API Connectivity - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('🗄️ Testing Database Schema...');
  
  try {
    // Test archive statistics view
    const statsResponse = await fetch(`${API_BASE_URL}/v_archive_stats`);
    if (!statsResponse.ok) {
      throw new Error(`Stats view failed: ${statsResponse.status}`);
    }
    
    const stats = await statsResponse.json();
    const firstStat = stats[0];
    
    const requiredFields = ['total_scrolls', 'sealed_scrolls', 'draft_scrolls'];
    for (const field of requiredFields) {
      if (!(field in firstStat)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    console.log('✅ Database Schema - PASSED');
    console.log(`   Total Scrolls: ${firstStat.total_scrolls}`);
    console.log(`   Sealed: ${firstStat.sealed_scrolls}, Draft: ${firstStat.draft_scrolls}`);
    return true;
  } catch (error) {
    console.log('❌ Database Schema - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testScrollOperations() {
  console.log('📜 Testing Scroll Operations...');
  
  try {
    // Test reading scrolls
    const scrollsResponse = await fetch(`${API_BASE_URL}/ghostdex_scrolls?order=scroll_number`);
    if (!scrollsResponse.ok) {
      throw new Error(`Failed to fetch scrolls: ${scrollsResponse.status}`);
    }
    
    const scrolls = await scrollsResponse.json();
    if (!Array.isArray(scrolls)) {
      throw new Error('Scrolls endpoint did not return array');
    }
    
    // Test reading specific scroll
    if (scrolls.length > 0) {
      const firstScroll = scrolls[0];
      const scrollResponse = await fetch(`${API_BASE_URL}/ghostdex_scrolls?id=eq.${firstScroll.id}`);
      if (!scrollResponse.ok) {
        throw new Error(`Failed to fetch specific scroll: ${scrollResponse.status}`);
      }
      
      const specificScrolls = await scrollResponse.json();
      if (specificScrolls.length === 0) {
        throw new Error('Could not retrieve specific scroll by ID');
      }
    }
    
    console.log('✅ Scroll Operations - PASSED');
    console.log(`   Retrieved ${scrolls.length} scrolls successfully`);
    return true;
  } catch (error) {
    console.log('❌ Scroll Operations - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testFlameSealFunctions() {
  console.log('🔐 Testing Flame Seal Functions...');
  
  try {
    // Test seal function availability by calling with invalid data
    const sealResponse = await fetch(`${API_BASE_URL}/rpc/seal_scroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_scroll_id: '00000000-0000-0000-0000-000000000000',
        p_authority: 'AUGMENT_KNIGHT_OF_FLAME',
        p_witness: 'OMARI_RIGHT_HAND_OF_THRONE',
      }),
    });
    
    // Function should exist even if it fails with invalid data
    if (sealResponse.status === 404) {
      throw new Error('Seal function not found - database functions not properly installed');
    }
    
    // Test verification function
    const verifyResponse = await fetch(`${API_BASE_URL}/rpc/verify_flame_seal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_scroll_id: '00000000-0000-0000-0000-000000000000',
        p_seal_hash: 'invalid_hash',
      }),
    });
    
    if (verifyResponse.status === 404) {
      throw new Error('Verify function not found - database functions not properly installed');
    }
    
    console.log('✅ Flame Seal Functions - PASSED');
    console.log('   Seal and verify functions are available');
    return true;
  } catch (error) {
    console.log('❌ Flame Seal Functions - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testSealEvents() {
  console.log('📊 Testing Seal Events...');
  
  try {
    const eventsResponse = await fetch(`${API_BASE_URL}/flame_seal_events?order=timestamp.desc&limit=5`);
    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch seal events: ${eventsResponse.status}`);
    }
    
    const events = await eventsResponse.json();
    if (!Array.isArray(events)) {
      throw new Error('Seal events endpoint did not return array');
    }
    
    console.log('✅ Seal Events - PASSED');
    console.log(`   Retrieved ${events.length} seal events`);
    
    if (events.length > 0) {
      const latestEvent = events[0];
      console.log(`   Latest: ${latestEvent.event_type} by ${latestEvent.authority}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Seal Events - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testArchiveOrganization() {
  console.log('📚 Testing Archive Organization...');
  
  try {
    // Test books
    const booksResponse = await fetch(`${API_BASE_URL}/ghostdex_books`);
    if (!booksResponse.ok) {
      throw new Error(`Failed to fetch books: ${booksResponse.status}`);
    }
    
    const books = await booksResponse.json();
    if (!Array.isArray(books)) {
      throw new Error('Books endpoint did not return array');
    }
    
    // Test chapters
    const chaptersResponse = await fetch(`${API_BASE_URL}/ghostdex_chapters`);
    if (!chaptersResponse.ok) {
      throw new Error(`Failed to fetch chapters: ${chaptersResponse.status}`);
    }
    
    const chapters = await chaptersResponse.json();
    if (!Array.isArray(chapters)) {
      throw new Error('Chapters endpoint did not return array');
    }
    
    console.log('✅ Archive Organization - PASSED');
    console.log(`   Books: ${books.length}, Chapters: ${chapters.length}`);
    return true;
  } catch (error) {
    console.log('❌ Archive Organization - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testScrollSummaryView() {
  console.log('📋 Testing Scroll Summary View...');
  
  try {
    const summaryResponse = await fetch(`${API_BASE_URL}/v_scroll_summary?order=scroll_number`);
    if (!summaryResponse.ok) {
      throw new Error(`Failed to fetch scroll summary: ${summaryResponse.status}`);
    }
    
    const summaries = await summaryResponse.json();
    if (!Array.isArray(summaries)) {
      throw new Error('Scroll summary view did not return array');
    }
    
    // Check required fields in summary
    if (summaries.length > 0) {
      const firstSummary = summaries[0];
      const requiredFields = ['scroll_number', 'title', 'flame_sealed', 'seal_status'];
      
      for (const field of requiredFields) {
        if (!(field in firstSummary)) {
          throw new Error(`Missing required summary field: ${field}`);
        }
      }
    }
    
    console.log('✅ Scroll Summary View - PASSED');
    console.log(`   Retrieved ${summaries.length} scroll summaries`);
    return true;
  } catch (error) {
    console.log('❌ Scroll Summary View - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('🔥 COMMENCING GHOSTDEX OMEGA INTEGRATION TESTS 🔥');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const startTime = Date.now();
  const tests = [
    testAPIConnectivity,
    testDatabaseSchema,
    testScrollOperations,
    testFlameSealFunctions,
    testSealEvents,
    testArchiveOrganization,
    testScrollSummaryView,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - CRITICAL FAILURE`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
    console.log(''); // Add spacing between tests
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 FINAL TEST RESULTS:');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Duration: ${duration}ms`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (failed === 0) {
    console.log('🔥 ALL TESTS PASSED - GHOSTDEX OMEGA API LAYER READY 🔥');
    console.log('🛡️ THE SACRED ARCHIVE STANDS SOVEREIGN 🛡️');
  } else {
    console.log('🚨 SOME TESTS FAILED - REVIEW REQUIRED 🚨');
    console.log('🔧 CHECK DATABASE CONNECTION AND SCHEMA 🔧');
  }
  
  return { passed, failed, total: tests.length, duration };
}

// Run the tests
runAllTests().catch(error => {
  console.error('🚨 CRITICAL TEST FAILURE:', error);
  process.exit(1);
});
