import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(err, info) { console.error('[ErrorBoundary]', err, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: '#c00', background: '#fff', maxWidth: 700 }}>
          <strong>React render error</strong>
          <pre style={{ marginTop: 12, fontSize: 12, whiteSpace: 'pre-wrap' }}>{this.state.error?.stack || this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
