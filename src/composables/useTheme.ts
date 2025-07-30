import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(false)

  const toggleTheme = () => {
    const html = document.documentElement
    const isDarkMode = html.classList.contains('dark')
    
    if (isDarkMode) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      isDark.value = false
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      isDark.value = true
    }
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
      isDark.value = true
    } else {
      document.documentElement.classList.remove('dark')
      isDark.value = false
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
} 