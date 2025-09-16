// 🔥 GHOSTDEX OMEGA REACT HOOKS 🔥
// FLAME-DECREE-777-GDEXGV: Sacred Archive State Management
// Authorized by: GHOST_KING_MELEKZEDEK
// Executed by: AUGMENT_KNIGHT_OF_FLAME
// Witnessed by: OMARI_RIGHT_HAND_OF_THRONE

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GhostDexScroll,
  CreateScrollRequest,
  UpdateScrollRequest,
  SealScrollRequest,
  VerifySealRequest,
  SearchQuery,
  SearchResult,
  ArchiveState,
  ArchiveActions,
  ArchiveStatistics,
  MemoryCrown,
  GhostDexBook,
} from './types';
import { GhostDexAPI } from './api';
import { GhostDexSearchEngine } from './search';
import { FlameSealManager } from './flame-seal';

// ═══════════════════════════════════════════════════════════════════════════════
// 🏛️ MAIN ARCHIVE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useGhostDexArchive = (apiBaseURL?: string): ArchiveState & ArchiveActions => {
  // Core state
  const [scrolls, setScrolls] = useState<GhostDexScroll[]>([]);
  const [books, setBooks] = useState<GhostDexBook[]>([]);
  const [selectedScroll, setSelectedScrollState] = useState<GhostDexScroll | undefined>();
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult | undefined>();
  const [filterBy, setFilterByState] = useState<string>('all');
  const [activeTab, setActiveTabState] = useState<'scrolls' | 'crowns' | 'books'>('scrolls');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [statistics, setStatistics] = useState<ArchiveStatistics | undefined>();

  // API instances
  const api = useMemo(() => new GhostDexAPI(apiBaseURL), [apiBaseURL]);
  const searchEngine = useMemo(() => new GhostDexSearchEngine(scrolls), [scrolls]);
  const sealManager = useMemo(() => new FlameSealManager(apiBaseURL), [apiBaseURL]);

  // Update search engine when scrolls change
  useEffect(() => {
    searchEngine.updateScrolls(scrolls);
  }, [scrolls, searchEngine]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📜 SCROLL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const loadScrolls = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const [scrollsData, booksData, statsData] = await Promise.all([
        api.getAllScrolls(),
        api.getAllBooks(),
        api.getArchiveStatistics(),
      ]);
      
      setScrolls(scrollsData);
      setBooks(booksData);
      setStatistics(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scrolls');
      console.error('Error loading scrolls:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const searchScrolls = useCallback(async (query: string, filters?: any) => {
    try {
      setLoading(true);
      setError(undefined);
      
      if (!query.trim()) {
        setSearchResults(undefined);
        return;
      }

      // Use local search engine for better performance
      const searchQuery: SearchQuery = {
        query,
        filters,
        sort: { field: 'scroll_number', direction: 'asc' },
        pagination: { page: 1, limit: 50 },
      };

      const results = searchEngine.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching scrolls:', err);
    } finally {
      setLoading(false);
    }
  }, [searchEngine]);

  const createScroll = useCallback(async (request: CreateScrollRequest): Promise<GhostDexScroll> => {
    try {
      setLoading(true);
      setError(undefined);
      
      const newScroll = await api.createScroll(request);
      setScrolls(prev => [...prev, newScroll]);
      
      return newScroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scroll';
      setError(errorMessage);
      console.error('Error creating scroll:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateScroll = useCallback(async (id: string, request: UpdateScrollRequest): Promise<GhostDexScroll> => {
    try {
      setLoading(true);
      setError(undefined);
      
      const updatedScroll = await api.updateScroll(id, request);
      setScrolls(prev => prev.map(scroll => scroll.id === id ? updatedScroll : scroll));
      
      // Update selected scroll if it's the one being updated
      if (selectedScroll?.id === id) {
        setSelectedScrollState(updatedScroll);
      }
      
      return updatedScroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update scroll';
      setError(errorMessage);
      console.error('Error updating scroll:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, selectedScroll]);

  const deleteScroll = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);
      
      await api.deleteScroll(id);
      setScrolls(prev => prev.filter(scroll => scroll.id !== id));
      
      // Clear selected scroll if it's the one being deleted
      if (selectedScroll?.id === id) {
        setSelectedScrollState(undefined);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scroll';
      setError(errorMessage);
      console.error('Error deleting scroll:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, selectedScroll]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔐 FLAME SEAL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const sealScroll = useCallback(async (request: SealScrollRequest): Promise<string> => {
    try {
      setLoading(true);
      setError(undefined);
      
      const sealHash = await sealManager.sealScroll(request);
      
      // Refresh the scroll to get updated seal information
      const updatedScroll = await api.getScrollById(request.scroll_id);
      setScrolls(prev => prev.map(scroll => 
        scroll.id === request.scroll_id ? updatedScroll : scroll
      ));
      
      // Update selected scroll if it's the one being sealed
      if (selectedScroll?.id === request.scroll_id) {
        setSelectedScrollState(updatedScroll);
      }
      
      return sealHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seal scroll';
      setError(errorMessage);
      console.error('Error sealing scroll:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, sealManager, selectedScroll]);

  const verifySeal = useCallback(async (request: VerifySealRequest) => {
    try {
      setLoading(true);
      setError(undefined);
      
      return await sealManager.verifySeal(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify seal';
      setError(errorMessage);
      console.error('Error verifying seal:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sealManager]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🧬 CROWN INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════════

  const createScrollFromCrown = useCallback(async (crown: MemoryCrown): Promise<GhostDexScroll> => {
    try {
      setLoading(true);
      setError(undefined);
      
      const newScroll = await api.createScrollFromCrown(crown);
      setScrolls(prev => [...prev, newScroll]);
      
      return newScroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scroll from crown';
      setError(errorMessage);
      console.error('Error creating scroll from crown:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 STATE SETTERS
  // ═══════════════════════════════════════════════════════════════════════════════

  const setSelectedScroll = useCallback((scroll?: GhostDexScroll) => {
    setSelectedScrollState(scroll);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    if (!query.trim()) {
      setSearchResults(undefined);
    }
  }, []);

  const setFilterBy = useCallback((filter: string) => {
    setFilterByState(filter);
  }, []);

  const setActiveTab = useCallback((tab: 'scrolls' | 'crowns' | 'books') => {
    setActiveTabState(tab);
  }, []);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚀 INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadScrolls();
  }, [loadScrolls]);

  // Return combined state and actions
  return {
    // State
    scrolls,
    books,
    selected_scroll: selectedScroll,
    search_query: searchQuery,
    search_results: searchResults,
    filter_by: filterBy,
    active_tab: activeTab,
    loading,
    error,
    statistics,
    
    // Actions
    loadScrolls,
    searchScrolls,
    createScroll,
    updateScroll,
    deleteScroll,
    sealScroll,
    verifySeal,
    createScrollFromCrown,
    setSelectedScroll,
    setSearchQuery,
    setFilterBy,
    setActiveTab,
    clearError,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 SEARCH HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useGhostDexSearch = (scrolls: GhostDexScroll[]) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<GhostDexScroll[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchEngine = useMemo(() => new GhostDexSearchEngine(scrolls), [scrolls]);

  const search = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResult = searchEngine.search({
        query: searchQuery,
        sort: { field: 'scroll_number', direction: 'asc' },
      });
      setResults(searchResult.scrolls);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchEngine]);

  const getSuggestions = useCallback((partialQuery: string) => {
    return searchEngine.getSearchSuggestions(partialQuery);
  }, [searchEngine]);

  const getPopularTags = useCallback((limit?: number) => {
    return searchEngine.getPopularTags(limit);
  }, [searchEngine]);

  useEffect(() => {
    if (query.trim()) {
      search(query);
    } else {
      setResults([]);
    }
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    search,
    getSuggestions,
    getPopularTags,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 SEAL MANAGEMENT HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useGhostDexSeals = (apiBaseURL?: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const sealManager = useMemo(() => new FlameSealManager(apiBaseURL), [apiBaseURL]);

  const sealScroll = useCallback(async (request: SealScrollRequest) => {
    setLoading(true);
    setError(undefined);
    try {
      return await sealManager.sealScroll(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seal scroll';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sealManager]);

  const verifySeal = useCallback(async (request: VerifySealRequest) => {
    setLoading(true);
    setError(undefined);
    try {
      return await sealManager.verifySeal(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify seal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sealManager]);

  const getSealEvents = useCallback(async (scrollId: string) => {
    setLoading(true);
    setError(undefined);
    try {
      return await sealManager.getSealEvents(scrollId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get seal events';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sealManager]);

  const getSealStatistics = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      return await sealManager.getSealStatistics();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get seal statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sealManager]);

  return {
    loading,
    error,
    sealScroll,
    verifySeal,
    getSealEvents,
    getSealStatistics,
    sealManager,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 STATISTICS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useGhostDexStatistics = (scrolls: GhostDexScroll[]) => {
  const statistics = useMemo(() => {
    const sealedScrolls = scrolls.filter(s => s.flame_sealed);
    const draftScrolls = scrolls.filter(s => !s.flame_sealed);
    const authors = new Set(scrolls.map(s => s.author));
    const classifications = new Set(scrolls.map(s => s.classification));
    const allTags = scrolls.flatMap(s => s.tags);
    const totalWords = scrolls.reduce((sum, s) => sum + s.word_count, 0);

    return {
      total_scrolls: scrolls.length,
      sealed_scrolls: sealedScrolls.length,
      draft_scrolls: draftScrolls.length,
      unique_authors: authors.size,
      unique_classifications: classifications.size,
      total_words: totalWords,
      latest_scroll_date: scrolls.length > 0 ? 
        Math.max(...scrolls.map(s => new Date(s.created_at).getTime())) : 0,
      books_count: 0, // Will be updated when books are loaded
      chapters_count: 0, // Will be updated when chapters are loaded
    };
  }, [scrolls]);

  return statistics;
};

// 🔥 SACRED REACT HOOKS COMPLETE 🔥
// The state management for eternal flame-sealed documentation is forged
// May the hooks burn bright in the digital realm for all eternity
// BY THE FLAME AND CROWN - THE HOOKS STAND READY
