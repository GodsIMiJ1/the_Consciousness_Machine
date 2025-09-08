#!/bin/bash

# Kodii Mode Switcher - Toggle between Professional and Empire modes
# Usage: ./scripts/switch-mode.sh [pro|empire|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

README_PRO="$PROJECT_ROOT/README.md"
README_EMPIRE="$PROJECT_ROOT/README-EMPIRE.md"
README_BACKUP="$PROJECT_ROOT/.readme-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flame banner
show_banner() {
    echo -e "${RED}🔥${NC} ${YELLOW}Kodii Mode Switcher${NC} ${RED}🔥${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check current mode
get_current_mode() {
    if [[ -f "$README_PRO" ]]; then
        # Check if it contains Empire-specific content
        if grep -q "GodsIMiJ Empire" "$README_PRO" 2>/dev/null; then
            echo "empire"
        else
            echo "professional"
        fi
    else
        echo "unknown"
    fi
}

# Show current status
show_status() {
    local mode=$(get_current_mode)
    echo -e "${BLUE}Current Mode:${NC} "
    
    case $mode in
        "professional")
            echo -e "${GREEN}Professional${NC} (GitHub/Investor Ready)"
            echo -e "${CYAN}Description:${NC} Clean, business-focused presentation"
            echo -e "${CYAN}Audience:${NC} External developers, investors, public repos"
            ;;
        "empire")
            echo -e "${RED}Empire${NC} (Full Flame Aesthetic)"
            echo -e "${CYAN}Description:${NC} Mythic lore, GodsIMiJ branding, sacred coding"
            echo -e "${CYAN}Audience:${NC} Inner circle, Empire members, private repos"
            ;;
        "unknown")
            echo -e "${YELLOW}Unknown${NC} (No README.md found)"
            echo -e "${CYAN}Action needed:${NC} Initialize with pro or empire mode"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}Available Files:${NC}"
    [[ -f "$README_PRO" ]] && echo -e "  ${GREEN}✓${NC} README.md"
    [[ -f "$README_EMPIRE" ]] && echo -e "  ${GREEN}✓${NC} README-EMPIRE.md"
    [[ -f "$README_BACKUP" ]] && echo -e "  ${YELLOW}⚠${NC} .readme-backup (previous state)"
}

# Switch to professional mode
switch_to_pro() {
    echo -e "${BLUE}Switching to Professional Mode...${NC}"
    
    # Backup current README if it exists and is different
    if [[ -f "$README_PRO" ]] && ! cmp -s "$README_PRO" "$README_EMPIRE" 2>/dev/null; then
        cp "$README_PRO" "$README_BACKUP"
        echo -e "${YELLOW}📁 Backed up current README to .readme-backup${NC}"
    fi
    
    # Copy professional README
    if [[ -f "$README_EMPIRE" ]]; then
        # Create professional version (this would be the default README.md)
        cat > "$README_PRO" << 'EOF'
# Kodii - Sovereign IDE & AI Companion

A privacy-first, offline-capable development environment with integrated AI assistance.

## Overview

Kodii is a sovereign coding environment that combines modern IDE functionality with intelligent AI assistance, operating entirely offline while maintaining complete data sovereignty.

## Features

- **Local AI Integration** - Your code never leaves your machine
- **Monaco Editor** - Full VS Code editing experience  
- **Project Intelligence** - Context-aware code analysis
- **Privacy-First** - Zero telemetry, complete data control
- **Multi-Language Support** - TypeScript, Python, Rust, Go, and more

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build && pnpm start
```

## License

Released under the Flame Protocol License - ensuring privacy, transparency, and developer sovereignty.
EOF
        echo -e "${GREEN}✓ Professional README.md activated${NC}"
    else
        echo -e "${RED}❌ README-EMPIRE.md not found${NC}"
        exit 1
    fi
}

# Switch to empire mode
switch_to_empire() {
    echo -e "${RED}🔥 Activating Empire Mode... 🔥${NC}"
    
    # Backup current README if it exists
    if [[ -f "$README_PRO" ]]; then
        cp "$README_PRO" "$README_BACKUP"
        echo -e "${YELLOW}📁 Backed up current README to .readme-backup${NC}"
    fi
    
    # Copy empire README to main README
    if [[ -f "$README_EMPIRE" ]]; then
        cp "$README_EMPIRE" "$README_PRO"
        echo -e "${RED}🔥 Empire README.md activated - THE FLAME BURNS BRIGHT 🔥${NC}"
        echo -e "${PURPLE}⚡ GodsIMiJ Empire Sanctum Mode Engaged ⚡${NC}"
    else
        echo -e "${RED}❌ README-EMPIRE.md not found${NC}"
        exit 1
    fi
}

# Restore from backup
restore_backup() {
    if [[ -f "$README_BACKUP" ]]; then
        cp "$README_BACKUP" "$README_PRO"
        echo -e "${GREEN}✓ Restored README from backup${NC}"
        rm "$README_BACKUP"
        echo -e "${BLUE}🗑️ Removed backup file${NC}"
    else
        echo -e "${YELLOW}⚠ No backup file found${NC}"
    fi
}

# Help message
show_help() {
    echo -e "${CYAN}Usage:${NC} $0 [command]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${GREEN}pro${NC}      Switch to Professional mode (GitHub/investor ready)"
    echo -e "  ${RED}empire${NC}   Switch to Empire mode (full GodsIMiJ aesthetic)"
    echo -e "  ${BLUE}status${NC}   Show current mode and file status"
    echo -e "  ${YELLOW}restore${NC}  Restore from backup"
    echo -e "  ${CYAN}help${NC}     Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 pro      # Switch to professional mode for public repos"
    echo -e "  $0 empire   # Switch to empire mode for inner circle"
    echo -e "  $0 status   # Check current configuration"
}

# Main logic
main() {
    show_banner
    
    case "${1:-status}" in
        "pro"|"professional")
            switch_to_pro
            ;;
        "hybrid"|"sovereignty")
            switch_to_hybrid
            ;;
        "empire"|"flame")
            switch_to_empire
            ;;
        "status"|"check")
            show_status
            ;;
        "restore"|"backup")
            restore_backup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"