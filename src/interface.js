import './style.css'

function setUp (canvasW, canvasH) {
  const appWrapper = document.createElement('div')
  appWrapper.classList.add('app-wrapper')
  document.body.appendChild(appWrapper)

  const { canvas, context } = setUpCanvas()
  canvas.width = canvasW
  canvas.height = canvasH

  // Set up retina
  const dpr = window.devicePixelRatio || 1
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.width = canvas.width * dpr
  canvas.height = canvas.height * dpr
  // context.scale(dpr, dpr) // This doesn't seem to work?
  
  appWrapper.appendChild(canvas)
  
  return { canvas, context }
}

function setUpCanvas () {
  const id = 'my-canvas'
  const canvas = canvasElement(id)
  const context = canvas.getContext('2d')

  return { canvas, context }
}

function canvasElement (id) {
  const element = document.createElement('canvas')
  element.id = id
  return element
}

export default setUp
