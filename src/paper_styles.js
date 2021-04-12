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
  }
}

export default { stylesLight, stylesDark }
