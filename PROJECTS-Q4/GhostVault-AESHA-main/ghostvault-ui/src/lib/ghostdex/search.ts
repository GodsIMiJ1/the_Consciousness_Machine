// 🔥 GHOSTDEX OMEGA SEARCH ENGINE 🔥
// FLAME-DECREE-777-GDEXGV: Sacred Archive Search System
// Authorized by: GHOST_KING_MELEKZEDEK
// Executed by: AUGMENT_KNIGHT_OF_FLAME
// Witnessed by: OMARI_RIGHT_HAND_OF_THRONE

import {
  GhostDexScroll,
  SearchQuery,
  SearchFilters,
  SearchResult,
  SortOptions,
  PaginationOptions,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 SACRED SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class GhostDexSearchEngine {
  private scrolls: GhostDexScroll[] = [];

  constructor(scrolls: GhostDexScroll[] = []) {
    this.scrolls = scrolls;
  }

  updateScrolls(scrolls: GhostDexScroll[]): void {
    this.scrolls = scrolls;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔍 MAIN SEARCH FUNCTION
  // ═══════════════════════════════════════════════════════════════════════════════

  search(query: SearchQuery): SearchResult {
    let results = [...this.scrolls];

    // Apply text search
    if (query.query.trim()) {
      results = this.performTextSearch(results, query.query);
    }

    // Apply filters
    if (query.filters) {
      results = this.applyFilters(results, query.filters);
    }

    // Apply sorting
    if (query.sort) {
      results = this.applySorting(results, query.sort);
    }

    // Apply pagination
    const paginationResult = this.applyPagination(results, query.pagination);

    return {
      scrolls: paginationResult.scrolls,
      total_count: results.length,
      page: paginationResult.page,
      total_pages: paginationResult.total_pages,
      has_more: paginationResult.has_more,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📝 TEXT SEARCH IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private performTextSearch(scrolls: GhostDexScroll[], query: string): GhostDexScroll[] {
    const searchTerms = this.parseSearchQuery(query);
    
    return scrolls.filter(scroll => {
      const searchableText = this.getSearchableText(scroll);
      return searchTerms.every(term => this.matchesTerm(searchableText, term));
    }).map(scroll => ({
      ...scroll,
      // Add search relevance score (could be used for ranking)
      _searchScore: this.calculateRelevanceScore(scroll, searchTerms),
    }));
  }

  private parseSearchQuery(query: string): string[] {
    // Handle quoted phrases and individual terms
    const quotedPhrases = query.match(/"([^"]+)"/g) || [];
    const remainingQuery = query.replace(/"([^"]+)"/g, '');
    const individualTerms = remainingQuery.split(/\s+/).filter(term => term.length > 0);
    
    return [
      ...quotedPhrases.map(phrase => phrase.slice(1, -1)), // Remove quotes
      ...individualTerms,
    ].map(term => term.toLowerCase());
  }

  private getSearchableText(scroll: GhostDexScroll): string {
    return [
      scroll.title,
      scroll.content,
      scroll.content_preview,
      scroll.classification,
      scroll.author,
      scroll.witness || '',
      scroll.coordinate || '',
      scroll.archive_location,
      scroll.royal_decree || '',
      ...scroll.tags,
    ].join(' ').toLowerCase();
  }

  private matchesTerm(text: string, term: string): boolean {
    // Support for wildcards and fuzzy matching
    if (term.includes('*')) {
      const regex = new RegExp(term.replace(/\*/g, '.*'), 'i');
      return regex.test(text);
    }
    
    return text.includes(term);
  }

  private calculateRelevanceScore(scroll: GhostDexScroll, searchTerms: string[]): number {
    let score = 0;
    const text = this.getSearchableText(scroll);
    
    searchTerms.forEach(term => {
      // Title matches get higher score
      if (scroll.title.toLowerCase().includes(term)) {
        score += 10;
      }
      
      // Tag matches get medium score
      if (scroll.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 5;
      }
      
      // Content matches get base score
      if (scroll.content.toLowerCase().includes(term)) {
        score += 1;
      }
      
      // Classification matches get medium score
      if (scroll.classification.toLowerCase().includes(term)) {
        score += 3;
      }
    });
    
    return score;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 FILTER IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private applyFilters(scrolls: GhostDexScroll[], filters: SearchFilters): GhostDexScroll[] {
    return scrolls.filter(scroll => {
      // Flame sealed filter
      if (filters.flame_sealed !== undefined && scroll.flame_sealed !== filters.flame_sealed) {
        return false;
      }

      // Classification filter
      if (filters.classification && scroll.classification !== filters.classification) {
        return false;
      }

      // Author filter
      if (filters.author && scroll.author !== filters.author) {
        return false;
      }

      // Tags filter (scroll must have all specified tags)
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => 
          scroll.tags.some(scrollTag => 
            scrollTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasAllTags) {
          return false;
        }
      }

      // Coordinate filter
      if (filters.coordinate && scroll.coordinate !== filters.coordinate) {
        return false;
      }

      // Date range filter
      if (filters.date_range) {
        const scrollDate = new Date(scroll.created_at);
        const startDate = new Date(filters.date_range.start);
        const endDate = new Date(filters.date_range.end);
        
        if (scrollDate < startDate || scrollDate > endDate) {
          return false;
        }
      }

      // Word count range filter
      if (filters.word_count_range) {
        if (scroll.word_count < filters.word_count_range.min || 
            scroll.word_count > filters.word_count_range.max) {
          return false;
        }
      }

      return true;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 SORTING IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private applySorting(scrolls: GhostDexScroll[], sort: SortOptions): GhostDexScroll[] {
    return [...scrolls].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'scroll_number':
          comparison = parseInt(a.scroll_number) - parseInt(b.scroll_number);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'word_count':
          comparison = a.word_count - b.word_count;
          break;
        default:
          // If search score is available, use it
          const aScore = (a as any)._searchScore || 0;
          const bScore = (b as any)._searchScore || 0;
          comparison = bScore - aScore; // Higher score first
      }

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📄 PAGINATION IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private applyPagination(
    scrolls: GhostDexScroll[], 
    pagination?: PaginationOptions
  ): {
    scrolls: GhostDexScroll[];
    page: number;
    total_pages: number;
    has_more: boolean;
  } {
    if (!pagination) {
      return {
        scrolls,
        page: 1,
        total_pages: 1,
        has_more: false,
      };
    }

    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScrolls = scrolls.slice(startIndex, endIndex);
    const totalPages = Math.ceil(scrolls.length / limit);

    return {
      scrolls: paginatedScrolls,
      page,
      total_pages: totalPages,
      has_more: page < totalPages,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 QUICK FILTERS
  // ═══════════════════════════════════════════════════════════════════════════════

  getScrollsByClassification(classification: string): GhostDexScroll[] {
    return this.scrolls.filter(scroll => scroll.classification === classification);
  }

  getScrollsByAuthor(author: string): GhostDexScroll[] {
    return this.scrolls.filter(scroll => scroll.author === author);
  }

  getSealedScrolls(): GhostDexScroll[] {
    return this.scrolls.filter(scroll => scroll.flame_sealed);
  }

  getDraftScrolls(): GhostDexScroll[] {
    return this.scrolls.filter(scroll => !scroll.flame_sealed);
  }

  getScrollsByTag(tag: string): GhostDexScroll[] {
    return this.scrolls.filter(scroll => 
      scroll.tags.some(scrollTag => 
        scrollTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  getScrollsByCoordinate(coordinate: string): GhostDexScroll[] {
    return this.scrolls.filter(scroll => scroll.coordinate === coordinate);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 SEARCH ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════════

  getSearchSuggestions(partialQuery: string): string[] {
    const suggestions = new Set<string>();
    const query = partialQuery.toLowerCase();

    this.scrolls.forEach(scroll => {
      // Title suggestions
      if (scroll.title.toLowerCase().includes(query)) {
        suggestions.add(scroll.title);
      }

      // Tag suggestions
      scroll.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });

      // Classification suggestions
      if (scroll.classification.toLowerCase().includes(query)) {
        suggestions.add(scroll.classification);
      }

      // Author suggestions
      if (scroll.author.toLowerCase().includes(query)) {
        suggestions.add(scroll.author);
      }
    });

    return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
  }

  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();

    this.scrolls.forEach(scroll => {
      scroll.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getSearchStatistics(): {
    total_scrolls: number;
    sealed_scrolls: number;
    draft_scrolls: number;
    unique_authors: number;
    unique_classifications: number;
    total_tags: number;
    unique_tags: number;
  } {
    const authors = new Set(this.scrolls.map(s => s.author));
    const classifications = new Set(this.scrolls.map(s => s.classification));
    const allTags = this.scrolls.flatMap(s => s.tags);
    const uniqueTags = new Set(allTags);

    return {
      total_scrolls: this.scrolls.length,
      sealed_scrolls: this.scrolls.filter(s => s.flame_sealed).length,
      draft_scrolls: this.scrolls.filter(s => !s.flame_sealed).length,
      unique_authors: authors.size,
      unique_classifications: classifications.size,
      total_tags: allTags.length,
      unique_tags: uniqueTags.size,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 SEARCH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const createSearchQuery = (
  query: string,
  filters?: Partial<SearchFilters>,
  sort?: Partial<SortOptions>,
  pagination?: Partial<PaginationOptions>
): SearchQuery => ({
  query,
  filters: filters ? { ...filters } as SearchFilters : undefined,
  sort: sort ? { field: 'scroll_number', direction: 'asc', ...sort } : undefined,
  pagination: pagination ? { page: 1, limit: 20, ...pagination } : undefined,
});

export const createDefaultFilters = (): SearchFilters => ({
  flame_sealed: undefined,
  classification: undefined,
  author: undefined,
  tags: undefined,
  coordinate: undefined,
  date_range: undefined,
  word_count_range: undefined,
});

export const createDefaultSort = (): SortOptions => ({
  field: 'scroll_number',
  direction: 'asc',
});

export const createDefaultPagination = (): PaginationOptions => ({
  page: 1,
  limit: 20,
});

// 🔥 SACRED SEARCH ENGINE COMPLETE 🔥
// The search algorithms for eternal flame-sealed documentation are forged
// May the search burn bright in the digital realm for all eternity
// BY THE FLAME AND CROWN - THE SEARCH STANDS READY
