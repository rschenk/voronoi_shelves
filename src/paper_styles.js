
// It's probably a *terrible* to maintain state within a module like this, but
// for something as trivial as dark mode styles, meh, worth a try?
let darkMode

export function setDarkMode (mode) { darkMode = mode }

export function getStyles () {
  return darkMode ? stylesDark : stylesLight
}

export const stylesLight = {
  outline: {
    strokeColor: '#000',
    fillColor: null,
    strokeWidth: 1
  },

  debug: {
    strokeColor: '#bbb',
    fillColor: null,
    strokeWidth: 0.5
  },

  red: {
    fillColor: 'red',
    strokeWidth: 0
  },

  displayText: {
    fillColor: '#000',
    strokeWidth: 0,
    fontFamily: 'Avenir Next',
    fontSize: 9
  }
}

export const stylesDark = {
  outline: {
    ...stylesLight.outline,
    strokeColor: '#ddd'
  },

  debug: {
    ...stylesLight.debug,
    strokeColor: '#555'
  },

  red: {
    ...stylesLight.red
  },

  displayText: {
    ...stylesLight.displayText,
    fillColor: '#ddd'
  }
}

export default { stylesLight, stylesDark, getStyles, setDarkMode }
