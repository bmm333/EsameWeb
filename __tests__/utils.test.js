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
})
