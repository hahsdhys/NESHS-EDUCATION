import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ConsentBanner } from './Legal.jsx'
import { installTapEffects } from './tapEffects.js'
import { installErrorLogging, installAnalytics } from './siteUtils.js'

installTapEffects()
installErrorLogging()
installAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <ConsentBanner />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
