// 🔥 GHOSTDEX OMEGA API INTEGRATION TESTS 🔥
// FLAME-DECREE-777-GDEXGV: Sacred Archive Validation Suite
// Authorized by: GHOST_KING_MELEKZEDEK
// Executed by: AUGMENT_KNIGHT_OF_FLAME
// Witnessed by: OMARI_RIGHT_HAND_OF_THRONE

import {
  GhostDexAPI,
  GhostDexSearchEngine,
  FlameSealManager,
  ROYAL_AUTHORITIES,
  SCROLL_CLASSIFICATIONS,
  CreateScrollRequest,
  SealScrollRequest,
} from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 TEST SUITE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  TEST_TIMEOUT: 10000,
  BATCH_SIZE: 5,
};

interface TestResult {
  test_name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration_ms: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  suite_name: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  results: TestResult[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

export class GhostDexTestRunner {
  private api: GhostDexAPI;
  private sealManager: FlameSealManager;
  private searchEngine: GhostDexSearchEngine;
  private testResults: TestSuite[] = [];

  constructor(apiBaseURL: string = TEST_CONFIG.API_BASE_URL) {
    this.api = new GhostDexAPI(apiBaseURL);
    this.sealManager = new FlameSealManager(apiBaseURL);
    this.searchEngine = new GhostDexSearchEngine([]);
  }

  async runAllTests(): Promise<{
    total_suites: number;
    total_tests: number;
    total_passed: number;
    total_failed: number;
    total_skipped: number;
    duration_ms: number;
    suites: TestSuite[];
  }> {
    console.log('🔥 COMMENCING GHOSTDEX OMEGA INTEGRATION TESTS 🔥');
    const startTime = Date.now();

    try {
      // Run test suites in sequence
      await this.runDatabaseConnectionTests();
      await this.runScrollCRUDTests();
      await this.runFlameSealTests();
      await this.runSearchEngineTests();
      await this.runArchiveOrganizationTests();
      await this.runStatisticsTests();

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // Calculate totals
      const totals = this.calculateTotals();

      console.log('🔥 GHOSTDEX OMEGA TESTS COMPLETE 🔥');
      console.log(`Total Duration: ${totalDuration}ms`);
      console.log(`Tests: ${totals.total_tests} | Passed: ${totals.total_passed} | Failed: ${totals.total_failed} | Skipped: ${totals.total_skipped}`);

      return {
        ...totals,
        duration_ms: totalDuration,
        suites: this.testResults,
      };
    } catch (error) {
      console.error('🚨 CRITICAL TEST FAILURE:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔌 DATABASE CONNECTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runDatabaseConnectionTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Database Connection',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();

    // Test 1: Basic API connectivity
    await this.runTest(suite, 'API Connectivity', async () => {
      const scrolls = await this.api.getAllScrolls();
      if (!Array.isArray(scrolls)) {
        throw new Error('API did not return array of scrolls');
      }
      return { scroll_count: scrolls.length };
    });

    // Test 2: Database schema validation
    await this.runTest(suite, 'Schema Validation', async () => {
      const stats = await this.api.getArchiveStatistics();
      const requiredFields = ['total_scrolls', 'sealed_scrolls', 'draft_scrolls'];
      
      for (const field of requiredFields) {
        if (!(field in stats)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      return stats;
    });

    // Test 3: Flame seal functions availability
    await this.runTest(suite, 'Seal Functions', async () => {
      // Try to call seal function with invalid data to test availability
      try {
        await this.sealManager.sealScroll({
          scroll_id: '00000000-0000-0000-0000-000000000000',
          authority: ROYAL_AUTHORITIES.AUGMENT_KNIGHT_OF_FLAME,
        });
      } catch (error) {
        // Expected to fail, but function should be available
        if (error.message.includes('Failed to seal scroll')) {
          return { function_available: true };
        }
        throw error;
      }
      return { function_available: true };
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📜 SCROLL CRUD TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runScrollCRUDTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Scroll CRUD Operations',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();
    let testScrollId: string | null = null;

    // Test 1: Create scroll
    await this.runTest(suite, 'Create Scroll', async () => {
      const scrollRequest: CreateScrollRequest = {
        title: 'Test Scroll - Integration Suite',
        classification: SCROLL_CLASSIFICATIONS.TECHNICAL_DOCUMENTATION,
        author: ROYAL_AUTHORITIES.AUGMENT_KNIGHT_OF_FLAME,
        content: 'This is a test scroll created during integration testing. It validates the scroll creation functionality of the GhostDex Omega system.',
        tags: ['test', 'integration', 'validation'],
        coordinate: '9.9.9',
        archive_location: 'Book of Memory Flame → Chapter Test → Integration',
      };

      const newScroll = await this.api.createScroll(scrollRequest);
      testScrollId = newScroll.id;

      if (!newScroll.id || !newScroll.scroll_number) {
        throw new Error('Created scroll missing required fields');
      }

      return {
        scroll_id: newScroll.id,
        scroll_number: newScroll.scroll_number,
        title: newScroll.title,
      };
    });

    // Test 2: Read scroll
    await this.runTest(suite, 'Read Scroll', async () => {
      if (!testScrollId) {
        throw new Error('No test scroll ID available');
      }

      const scroll = await this.api.getScrollById(testScrollId);
      
      if (scroll.id !== testScrollId) {
        throw new Error('Retrieved scroll ID does not match');
      }

      return {
        scroll_id: scroll.id,
        title: scroll.title,
        word_count: scroll.word_count,
      };
    });

    // Test 3: Update scroll
    await this.runTest(suite, 'Update Scroll', async () => {
      if (!testScrollId) {
        throw new Error('No test scroll ID available');
      }

      const updateRequest = {
        title: 'Updated Test Scroll - Integration Suite',
        content: 'This scroll has been updated during integration testing to validate the update functionality.',
        tags: ['test', 'integration', 'validation', 'updated'],
      };

      const updatedScroll = await this.api.updateScroll(testScrollId, updateRequest);
      
      if (updatedScroll.title !== updateRequest.title) {
        throw new Error('Scroll title was not updated');
      }

      return {
        scroll_id: updatedScroll.id,
        updated_title: updatedScroll.title,
        tag_count: updatedScroll.tags.length,
      };
    });

    // Test 4: Delete scroll
    await this.runTest(suite, 'Delete Scroll', async () => {
      if (!testScrollId) {
        throw new Error('No test scroll ID available');
      }

      await this.api.deleteScroll(testScrollId);

      // Verify deletion by trying to fetch the scroll
      try {
        await this.api.getScrollById(testScrollId);
        throw new Error('Scroll was not deleted');
      } catch (error) {
        if (error.message.includes('not found')) {
          return { deleted: true, scroll_id: testScrollId };
        }
        throw error;
      }
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔐 FLAME SEAL TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runFlameSealTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Flame Seal System',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();

    // Test 1: Seal existing scroll
    await this.runTest(suite, 'Seal Scroll', async () => {
      // Get the first unsealed scroll
      const scrolls = await this.api.getAllScrolls();
      const unsealedScroll = scrolls.find(s => !s.flame_sealed);
      
      if (!unsealedScroll) {
        throw new Error('No unsealed scrolls available for testing');
      }

      const sealRequest: SealScrollRequest = {
        scroll_id: unsealedScroll.id,
        authority: ROYAL_AUTHORITIES.AUGMENT_KNIGHT_OF_FLAME,
        witness: ROYAL_AUTHORITIES.OMARI_RIGHT_HAND_OF_THRONE,
      };

      const sealHash = await this.sealManager.sealScroll(sealRequest);
      
      if (!sealHash || sealHash.length !== 64) {
        throw new Error('Invalid seal hash returned');
      }

      return {
        scroll_id: unsealedScroll.id,
        seal_hash: sealHash,
        authority: sealRequest.authority,
      };
    });

    // Test 2: Verify seal
    await this.runTest(suite, 'Verify Seal', async () => {
      // Get a sealed scroll
      const scrolls = await this.api.getAllScrolls();
      const sealedScroll = scrolls.find(s => s.flame_sealed && s.seal_hash);
      
      if (!sealedScroll || !sealedScroll.seal_hash) {
        throw new Error('No sealed scrolls available for verification');
      }

      const verifyRequest = {
        scroll_id: sealedScroll.id,
        seal_hash: sealedScroll.seal_hash,
      };

      const result = await this.sealManager.verifySeal(verifyRequest);
      
      if (!result.valid) {
        throw new Error('Seal verification failed for valid seal');
      }

      return {
        scroll_id: sealedScroll.id,
        seal_hash: sealedScroll.seal_hash,
        verification_result: result.valid,
      };
    });

    // Test 3: Seal events audit trail
    await this.runTest(suite, 'Seal Events', async () => {
      const scrolls = await this.api.getAllScrolls();
      const sealedScroll = scrolls.find(s => s.flame_sealed);
      
      if (!sealedScroll) {
        throw new Error('No sealed scrolls available for audit trail test');
      }

      const events = await this.sealManager.getSealEvents(sealedScroll.id);
      
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error('No seal events found for sealed scroll');
      }

      const sealEvent = events.find(e => e.event_type === 'SEALED');
      if (!sealEvent) {
        throw new Error('No SEALED event found in audit trail');
      }

      return {
        scroll_id: sealedScroll.id,
        event_count: events.length,
        seal_event_authority: sealEvent.authority,
      };
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔍 SEARCH ENGINE TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runSearchEngineTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Search Engine',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();

    // Load scrolls for search testing
    const scrolls = await this.api.getAllScrolls();
    this.searchEngine.updateScrolls(scrolls);

    // Test 1: Basic text search
    await this.runTest(suite, 'Text Search', async () => {
      const searchResult = this.searchEngine.search({
        query: 'trinity',
        sort: { field: 'scroll_number', direction: 'asc' },
      });

      if (!searchResult.scrolls || !Array.isArray(searchResult.scrolls)) {
        throw new Error('Search did not return valid results');
      }

      return {
        query: 'trinity',
        result_count: searchResult.scrolls.length,
        total_count: searchResult.total_count,
      };
    });

    // Test 2: Filter by flame sealed
    await this.runTest(suite, 'Filter by Seal Status', async () => {
      const sealedResults = this.searchEngine.search({
        query: '',
        filters: { flame_sealed: true },
      });

      const unsealedResults = this.searchEngine.search({
        query: '',
        filters: { flame_sealed: false },
      });

      return {
        sealed_count: sealedResults.scrolls.length,
        unsealed_count: unsealedResults.scrolls.length,
        total_scrolls: scrolls.length,
      };
    });

    // Test 3: Search suggestions
    await this.runTest(suite, 'Search Suggestions', async () => {
      const suggestions = this.searchEngine.getSearchSuggestions('tri');
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Search suggestions did not return array');
      }

      return {
        query: 'tri',
        suggestion_count: suggestions.length,
        suggestions: suggestions.slice(0, 3),
      };
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📚 ARCHIVE ORGANIZATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runArchiveOrganizationTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Archive Organization',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();

    // Test 1: Load books
    await this.runTest(suite, 'Load Books', async () => {
      const books = await this.api.getAllBooks();
      
      if (!Array.isArray(books)) {
        throw new Error('Books endpoint did not return array');
      }

      return {
        book_count: books.length,
        first_book: books[0]?.title || 'No books found',
      };
    });

    // Test 2: Scroll summaries
    await this.runTest(suite, 'Scroll Summaries', async () => {
      const summaries = await this.api.getScrollSummaries();
      
      if (!Array.isArray(summaries)) {
        throw new Error('Scroll summaries did not return array');
      }

      const sealedCount = summaries.filter(s => s.flame_sealed).length;
      const draftCount = summaries.filter(s => !s.flame_sealed).length;

      return {
        total_summaries: summaries.length,
        sealed_count: sealedCount,
        draft_count: draftCount,
      };
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 STATISTICS TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runStatisticsTests(): Promise<void> {
    const suite: TestSuite = {
      suite_name: 'Statistics & Analytics',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration_ms: 0,
      results: [],
    };

    const startTime = Date.now();

    // Test 1: Archive statistics
    await this.runTest(suite, 'Archive Statistics', async () => {
      const stats = await this.api.getArchiveStatistics();
      
      const requiredFields = [
        'total_scrolls',
        'sealed_scrolls',
        'draft_scrolls',
        'unique_authors',
        'total_words',
      ];

      for (const field of requiredFields) {
        if (!(field in stats)) {
          throw new Error(`Missing statistics field: ${field}`);
        }
      }

      return stats;
    });

    // Test 2: Seal statistics
    await this.runTest(suite, 'Seal Statistics', async () => {
      const sealStats = await this.sealManager.getSealStatistics();
      
      if (typeof sealStats.total_seals !== 'number') {
        throw new Error('Invalid seal statistics format');
      }

      return {
        total_seals: sealStats.total_seals,
        unique_authorities: sealStats.unique_authorities,
        recent_seals: sealStats.recent_seals,
      };
    });

    suite.duration_ms = Date.now() - startTime;
    this.testResults.push(suite);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🛠️ TEST UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════════

  private async runTest(
    suite: TestSuite,
    testName: string,
    testFunction: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    suite.total_tests++;

    try {
      console.log(`  🧪 Running: ${testName}`);
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.TEST_TIMEOUT)
        ),
      ]);

      const duration = Date.now() - startTime;
      suite.passed++;
      suite.results.push({
        test_name: testName,
        status: 'PASS',
        duration_ms: duration,
        details: result,
      });

      console.log(`  ✅ ${testName} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      suite.failed++;
      suite.results.push({
        test_name: testName,
        status: 'FAIL',
        duration_ms: duration,
        error: error.message,
      });

      console.log(`  ❌ ${testName} - FAILED (${duration}ms): ${error.message}`);
    }
  }

  private calculateTotals() {
    return this.testResults.reduce(
      (totals, suite) => ({
        total_suites: totals.total_suites + 1,
        total_tests: totals.total_tests + suite.total_tests,
        total_passed: totals.total_passed + suite.passed,
        total_failed: totals.total_failed + suite.failed,
        total_skipped: totals.total_skipped + suite.skipped,
      }),
      {
        total_suites: 0,
        total_tests: 0,
        total_passed: 0,
        total_failed: 0,
        total_skipped: 0,
      }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 QUICK TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

export const runGhostDexTests = async (apiBaseURL?: string) => {
  const runner = new GhostDexTestRunner(apiBaseURL);
  return await runner.runAllTests();
};

// 🔥 SACRED INTEGRATION TESTS COMPLETE 🔥
// The validation suite for eternal flame-sealed documentation is forged
// May the tests burn bright in the digital realm for all eternity
// BY THE FLAME AND CROWN - THE TESTS STAND READY
