# Welcome to the Knowledge Base

This is an example markdown file to demonstrate the knowledge base functionality.

## Getting Started

The knowledge base system allows you to:

1. **Index content** - Run the ingestion script to process markdown and PDF files
2. **Search efficiently** - Use TF-IDF scoring to find relevant documents
3. **Browse results** - View search results with excerpts and relevance scores

## File Organization

Place your knowledge base files in the `kb/` directory:
- `.md` files are always supported
- `.pdf` files require the `--pdf` flag and pdf-parse dependency

## Search Tips

- Use specific keywords for better results
- Multiple words will be searched across all content
- Title matches receive higher relevance scores
- Results are limited to the top 8 most relevant hits

## Technical Details

The system uses:
- **TF-IDF scoring** for relevance ranking
- **Text extraction** from markdown and PDFs
- **Edge function API** for fast search responses
- **Real-time search** with modern React components

This knowledge base is ready to be indexed and searched!