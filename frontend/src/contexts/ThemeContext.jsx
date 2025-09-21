import { createContext, useContext, useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Enhanced color palette - eye-catching and modern
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6366f1', // Indigo - modern and professional
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ec4899', // Pink - vibrant and engaging
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10b981', // Emerald - fresh and positive
        light: '#34d399',
        dark: '#059669',
      },
      warning: {
        main: '#f59e0b', // Amber - warm and attention-grabbing
        light: '#fbbf24',
        dark: '#d97706',
      },
      error: {
        main: '#ef4444', // Red - clear and decisive
        light: '#f87171',
        dark: '#dc2626',
      },
      info: {
        main: '#3b82f6', // Blue - trustworthy and calm
        light: '#60a5fa',
        dark: '#2563eb',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
      },
      grey: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '10px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#818cf8', // Lighter indigo for dark mode
        light: '#a5b4fc',
        dark: '#6366f1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f472b6', // Lighter pink for dark mode
        light: '#f9a8d4',
        dark: '#ec4899',
        contrastText: '#ffffff',
      },
      success: {
        main: '#34d399', // Lighter emerald
        light: '#6ee7b7',
        dark: '#10b981',
      },
      warning: {
        main: '#fbbf24', // Lighter amber
        light: '#fcd34d',
        dark: '#f59e0b',
      },
      error: {
        main: '#f87171', // Lighter red
        light: '#fca5a5',
        dark: '#ef4444',
      },
      info: {
        main: '#60a5fa', // Lighter blue
        light: '#93c5fd',
        dark: '#3b82f6',
      },
      background: {
        default: '#0f172a', // Slate 900
        paper: '#1e293b', // Slate 800
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      },
      grey: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '10px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#1e293b',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: '#1e293b',
          },
        },
      },
    },
  })

  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default CustomThemeProvider