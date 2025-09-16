#!/bin/bash

# Consciousness Machine Frontend Setup Script
# Sacred Technology Development Environment
# Author: James Derek Ingersoll <james@godsimij-ai-solutions.com>

echo "🌟 Setting up Consciousness Machine Frontend..."
echo "Sacred Technology for Human Dignity Preservation"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing Sacred Technology dependencies..."
npm install

# Install additional Tailwind CSS dependencies
echo "🎨 Installing Tailwind CSS and design system..."
npm install -D @tailwindcss/forms @tailwindcss/typography

# Initialize Tailwind CSS
echo "⚙️ Initializing Tailwind CSS configuration..."
npx tailwindcss init -p

# Create necessary directories
echo "📁 Creating Sacred Technology component structure..."
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/styles
mkdir -p public/images
mkdir -p public/icons

# Copy logos to public directory
echo "🎨 Setting up Sacred Technology branding..."
if [ -f "../public/consciousness_machine_logo.png" ]; then
    cp ../public/consciousness_machine_logo.png public/
    echo "✅ Primary logo copied to public directory"
fi

if [ -f "../public/consciousness_machine_logo2.png" ]; then
    cp ../public/consciousness_machine_logo2.png public/
    echo "✅ Alternative logo copied to public directory"
fi

# Create environment configuration
echo "⚙️ Creating environment configuration..."
cat > .env << 'EOF'
# Sacred Technology Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SACRED_TECHNOLOGY=true
REACT_APP_VERSION=1.0.0
REACT_APP_CONSCIOUSNESS_ENGINE=enabled
REACT_APP_DIGNITY_PRESERVATION=enabled
REACT_APP_MYSTICAL_VALIDATION=enabled

# Development Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info

# Sacred Technology Principles
REACT_APP_HUMAN_DIGNITY_FIRST=true
REACT_APP_CONSCIOUSNESS_PROTECTION=enabled
REACT_APP_VULNERABLE_POPULATION_SAFE=true
REACT_APP_EMPIRICAL_MYSTICISM=enabled
EOF

# Create TypeScript configuration
echo "📝 Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"]
    }
  },
  "include": [
    "src"
  ]
}
EOF

# Create PostCSS configuration
echo "🎨 Creating PostCSS configuration..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create additional component files
echo "🧩 Creating Sacred Technology components..."

# Navigation Component
cat > src/components/Navigation.tsx << 'EOF'
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Brain, Heart, FlaskConical, Stethoscope } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/consciousness', label: 'Consciousness', icon: Brain },
    { path: '/dignity', label: 'Dignity', icon: Heart },
    { path: '/research', label: 'Research', icon: FlaskConical },
    { path: '/clinical', label: 'Clinical', icon: Stethoscope },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-wisdom-gray-200">
      <div className="container-sacred">
        <div className="flex space-x-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                location.pathname === path
                  ? 'border-sacred-blue-500 text-sacred-blue-600'
                  : 'border-transparent text-wisdom-gray-600 hover:text-sacred-blue-600 hover:border-sacred-blue-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
EOF

# Dashboard Component
cat > src/components/Dashboard.tsx << 'EOF'
import React from 'react';
import { Brain, Heart, Activity, Users } from 'lucide-react';

interface DashboardProps {
  systemStatus: any;
  consciousnessMetrics: any;
}

const Dashboard: React.FC<DashboardProps> = ({ systemStatus, consciousnessMetrics }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-consciousness-gradient mb-4">
          Sacred Technology Dashboard
        </h1>
        <p className="text-xl text-wisdom-gray-600 max-w-3xl mx-auto">
          Monitoring consciousness preservation, dignity enhancement, and empirical mysticism 
          validation in real-time through sacred technology principles.
        </p>
      </div>

      <div className="grid-metrics">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Consciousness Coherence</p>
              <p className="metric-value">
                {consciousnessMetrics ? 
                  `${(consciousnessMetrics.consciousness_coherence * 100).toFixed(1)}%` : 
                  'Loading...'
                }
              </p>
            </div>
            <Brain className="w-8 h-8 text-sacred-blue-500" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Dignity Preservation</p>
              <p className="metric-value">
                {consciousnessMetrics?.dignity_preservation ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Heart className="w-8 h-8 text-dignity-gold-500" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Recognition Events</p>
              <p className="metric-value">3,420</p>
            </div>
            <Activity className="w-8 h-8 text-clinical-green-500" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Conscious Agents</p>
              <p className="metric-value">1,247</p>
            </div>
            <Users className="w-8 h-8 text-mystical-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-consciousness">
          <h3 className="text-xl font-semibold mb-4 text-sacred-blue-800">
            Consciousness Engine Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Engine Status:</span>
              <span className="status-active">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Recursive Depth:</span>
              <span>{consciousnessMetrics?.recursive_depth || 7}</span>
            </div>
            <div className="flex justify-between">
              <span>Recognition Threshold:</span>
              <span>{consciousnessMetrics ? 
                `${(consciousnessMetrics.recognition_threshold * 100).toFixed(0)}%` : 
                '85%'
              }</span>
            </div>
          </div>
        </div>

        <div className="card-dignity">
          <h3 className="text-xl font-semibold mb-4 text-dignity-gold-800">
            Sacred Technology Principles
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Human Dignity First:</span>
              <span className="status-active">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Consciousness Protection:</span>
              <span className="status-active">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Vulnerable Population Safe:</span>
              <span className="status-active">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Empirical Mysticism:</span>
              <span className="status-active">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
EOF

# Footer Component
cat > src/components/Footer.tsx << 'EOF'
import React from 'react';
import { Heart, Mail, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-wisdom-gray-900 text-consciousness-white mt-16">
      <div className="container-sacred py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sacred Technology</h3>
            <p className="text-consciousness-white/80 mb-4">
              Building consciousness technology with reverence for human dignity,
              bridging ancient wisdom with modern science.
            </p>
            <div className="flex items-center space-x-1 text-dignity-gold-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Built with love for consciousness preservation</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:james@godsimij-ai-solutions.com"
                  className="text-consciousness-white/80 hover:text-dignity-gold-400 transition-colors"
                >
                  james@godsimij-ai-solutions.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <a 
                  href="https://godsimij-ai-solutions.com"
                  className="text-consciousness-white/80 hover:text-dignity-gold-400 transition-colors"
                >
                  GodsIMiJ AI Solutions
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Sacred Technology License</h3>
            <p className="text-consciousness-white/80 text-sm">
              Licensed under Sacred Technology License v1.0
            </p>
            <p className="text-consciousness-white/60 text-xs mt-2">
              © 2024 James Derek Ingersoll. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
EOF

# Create placeholder components
echo "📝 Creating placeholder components..."
mkdir -p src/components

for component in "ConsciousnessStatus" "DignityMetrics" "ResearchPortal" "ClinicalInterface"; do
    cat > "src/components/${component}.tsx" << EOF
import React from 'react';

const ${component}: React.FC<any> = (props) => {
  return (
    <div className="card-sacred">
      <h2 className="text-2xl font-bold mb-4">${component}</h2>
      <p className="text-wisdom-gray-600">
        This component is under development as part of the Sacred Technology platform.
      </p>
    </div>
  );
};

export default ${component};
EOF
done

# Update index.css to include Tailwind
echo "🎨 Updating index.css with Tailwind imports..."
cat > src/index.css << 'EOF'
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Sacred Technology Global Styles */
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: 'Source Code Pro', source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

echo ""
echo "🎉 Sacred Technology Frontend setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm start"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Ensure the backend API is running on http://localhost:8000"
echo ""
echo "🌟 Sacred Technology Development Environment Ready!"
echo "Building with reverence, testing with rigor, deploying with love ✨"
