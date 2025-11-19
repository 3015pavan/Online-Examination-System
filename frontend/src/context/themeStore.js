import create from 'zustand';

const useThemeStore = create((set) => ({
  theme: typeof window !== 'undefined' && localStorage.getItem('theme')
    ? localStorage.getItem('theme')
    : 'light',
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  },
}));

export default useThemeStore;
