import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { addCollection } from '@iconify/react'
import solarIcons from '@iconify-json/solar/icons.json'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppThemeProvider } from './context/ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

addCollection(solarIcons)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppThemeProvider>
  </StrictMode>,
)
