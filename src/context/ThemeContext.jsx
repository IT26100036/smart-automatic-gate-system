import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const ThemeToggleContext = createContext({ toggleTheme: () => {}, mode: 'light' });

export function useThemeToggle() {
  return useContext(ThemeToggleContext);
}

function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#f97316' },
      ...(mode === 'light'
        ? { background: { default: '#f5f5f5', paper: '#ffffff' } }
        : { background: { default: '#0f0f0f', paper: '#1a1a1a' } }),
    },
    shape: { borderRadius: 10 },
    typography: { fontFamily: '"Geist", system-ui, sans-serif' },
    components: {
      MuiButton: {
        styleOverrides: { containedPrimary: { fontWeight: 700 } },
      },
    },
  });
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
}
