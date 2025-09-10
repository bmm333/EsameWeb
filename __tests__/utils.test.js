import { Utils } from '../src/js/utils.js'

describe('Utils', () => {
  test('getCurrentYear returns the current year', () => {
    const year = new Date().getFullYear()
    expect(Utils.getCurrentYear()).toBe(year)
  })

  test('getTheme returns default theme when none is set', () => {
    document.body.removeAttribute("data-bs-theme")
    expect(Utils.getTheme()).toBe("light")
  })
  test('should set --vh CSS variable', () => {
    Utils.setVh();
    const vh = window.innerHeight * 0.01;
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--vh').trim();
    expect(cssVar).toBe(`${vh}px`);
  })
  test('should set and get theme', () => {
    Utils.setTheme('dark');
    expect(Utils.getTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  
    Utils.setTheme('light');
    expect(Utils.getTheme()).toBe('light');
  })
  test('should toggle theme', () => {
    Utils.setTheme('light');
    Utils.toggleTheme();
    expect(Utils.getTheme()).toBe('dark');
    Utils.toggleTheme();
    expect(Utils.getTheme()).toBe('light');
  })  
})
