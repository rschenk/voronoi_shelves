
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
    fontFamily: 'Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Helvetica, Ubuntu, Roboto, Noto, Arial, sans-serif',
    fontSize: 14
  },

  etchText: {
    fillColor: null,
    strokeWidth: 1,
    strokeColor: '#000',
    fontFamily: 'OLF ModA',
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
  },

  etchText: {
    ...stylesLight.etchText,
    strokeColor: '#ddd'
  }
}

export const stylesLaser = {
  outline1: {
    ...stylesLight.outline,
    strokeColor: '#000000'
  },

  outline2: {
    ...stylesLight.outline,
    strokeColor: '#0072B2'
  },

  outline3: {
    ...stylesLight.outline,
    strokeColor: '#009E73'
  },

  outline4: {
    ...stylesLight.outline,
    strokeColor: '#56B4E9'
  }
}

export default { stylesLight, stylesDark, stylesLaser, getStyles, setDarkMode }
