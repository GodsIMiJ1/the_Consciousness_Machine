import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error boundary for production debugging
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Chamber Error:', error);
    return (
      <div style={{
        padding: '20px',
        background: '#0b0b0d',
        color: '#ff5f1f',
        fontFamily: 'monospace',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1>🔥 Chamber Initialization Error</h1>
        <p>The sacred ritual has encountered an error. Check console for details.</p>
        <pre style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
