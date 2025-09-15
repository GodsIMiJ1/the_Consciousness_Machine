import { useState, useRef, useEffect } from 'react';
import { Search, Clock, FileText, Download, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SearchHit {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  updatedAt: string;
  score: number;
  filePath?: string;
  category?: string;
  type?: 'document' | 'article' | 'faq' | 'manual';
}

interface SearchFilters {
  category: string;
  type: string;
  dateRange: string;
  minScore: number;
}

export function KBSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    type: '',
    dateRange: '',
    minScore: 0.5
  });

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('kb-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const saveSearchToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updatedHistory = [
      searchQuery,
      ...searchHistory.filter(h => h !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('kb-search-history', JSON.stringify(updatedHistory));
  };

  const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
    e?.preventDefault();
    
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) {
      toast({
        title: 'Search Required',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    saveSearchToHistory(queryToSearch);
    
    try {
      // Call edge function for AI-powered search
      const { data, error } = await supabase.functions.invoke('api', {
        body: {
          type: 'search',
          query: queryToSearch,
          filters: filters
        }
      });

      if (error) throw error;

      const searchResults = data?.hits || [];
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try different search terms or adjust your filters',
        });
      } else {
        toast({
          title: 'Search completed',
          description: `Found ${searchResults.length} results`,
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: error.message || 'Failed to search knowledge base. Please try again.',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      dateRange: '',
      minScore: 0.5
    });
  };

  const exportResults = () => {
    const exportData = {
      query,
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        title: r.title,
        excerpt: r.excerpt,
        score: r.score,
        filePath: r.filePath,
        category: r.category
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-base-search-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Results exported',
      description: 'Search results have been downloaded as JSON',
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'manual':
        return '📖';
      case 'faq':
        return '❓';
      case 'article':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Knowledge Base Search</h1>
          <p className="text-text-muted mt-1">
            AI-powered search through documentation and knowledge articles
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              className="btn-outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search Form */}
      <Card className="aura-card">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for documentation, FAQs, procedures..."
                  className="pl-10 input"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !query.trim()}
                className="btn-primary"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Quick Search History */}
            {searchHistory.length > 0 && !hasSearched && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-text-muted">Recent searches:</span>
                {searchHistory.slice(0, 5).map((historyQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(historyQuery);
                      handleSearch(undefined, historyQuery);
                    }}
                    className="text-xs btn-outline"
                  >
                    {historyQuery}
                  </Button>
                ))}
              </div>
            )}
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-text mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-bg border-border">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text mb-2 block">Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-bg border-border">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text mb-2 block">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="bg-bg border-border">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any time</SelectItem>
                      <SelectItem value="week">Past week</SelectItem>
                      <SelectItem value="month">Past month</SelectItem>
                      <SelectItem value="year">Past year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="btn-outline w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-text">
              Search Results
              {results.length > 0 && (
                <span className="text-text-muted ml-2 font-normal">
                  ({results.length} {results.length === 1 ? 'result' : 'results'})
                </span>
              )}
            </h2>
          </div>

          {results.length === 0 && !isLoading && (
            <Card className="aura-card">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-text-muted mb-4" />
                <h3 className="text-lg font-heading font-semibold text-text mb-2">No Results Found</h3>
                <p className="text-text-muted mb-4">
                  No documents match your search query "{query}"
                </p>
                <div className="text-sm text-text-muted space-y-2">
                  <p className="font-medium">Try:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Different or broader search terms</li>
                    <li>Removing filters to expand results</li>
                    <li>Checking spelling and terminology</li>
                    <li>Using synonyms or related terms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((hit) => (
                <Card key={hit.id} className="aura-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-text flex items-center gap-2">
                        <span>{getTypeIcon(hit.type)}</span>
                        {hit.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={`${getScoreColor(hit.score)} text-xs`}>
                          {Math.round(hit.score * 100)}% match
                        </Badge>
                        {hit.category && (
                          <Badge variant="outline" className="text-xs">
                            {hit.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(hit.updatedAt)}
                      </div>
                      {hit.filePath && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="font-mono text-xs">{hit.filePath}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm leading-relaxed text-text">
                      {hit.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <Card className="aura-card">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-heading font-semibold text-text mb-2">Ready to Search</h3>
            <p className="text-text-muted mb-4">
              Enter a search query above to find relevant documents and articles
            </p>
            <div className="text-sm text-text-muted">
              <p className="font-medium mb-2">Search capabilities:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>AI-powered semantic search</li>
                <li>Full-text content analysis</li>
                <li>Category and type filtering</li>
                <li>Relevance scoring</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}