import paper from 'paper'
import strftime from 'strftime'
import paperStyles from './paper_styles.js'
import './style.css'

function setUp (canvasW, canvasH, { initializePaper = true, darkMode = false }) {
  if (darkMode) { document.querySelector('body').classList.add('dark') }
  paperStyles.setDarkMode(darkMode)

  const appWrapper = document.createElement('div')
  appWrapper.classList.add('app-wrapper')
  document.body.appendChild(appWrapper)

  const { canvas, context } = setUpCanvas()
  canvas.width = canvasW
  canvas.height = canvasH

  if (initializePaper) {
    setUpPaper(canvas)
  } else {
    setUpRetina(canvas, context)
  }

  appWrapper.appendChild(canvas)

  document.addEventListener('keypress', (e) => { cmdS(e, saveAsSVG) })

  return { canvas, context, paper }
}

function setUpCanvas () {
  const id = 'my-canvas'
  const canvas = canvasElement(id)
  const context = canvas.getContext('2d')

  return { canvas, context }
}

function setUpRetina (canvas, context) {
  const dpr = window.devicePixelRatio || 1
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.width = canvas.width * dpr
  canvas.height = canvas.height * dpr
  context.scale(dpr, dpr) // This only seems necessary when NOT using paperjs
}

function setUpPaper (canvas) {
  paper.setup(canvas)
  paper.project.currentStyle = paperStyles.getStyles().outline
}

function canvasElement (id) {
  const element = document.createElement('canvas')
  element.id = id
  return element
}

function cmdS (event, command) {
  const s = 115
  if ((event.ctrlKey || event.metaKey) && event.which === s) {
    event.preventDefault()
    command()
    return false
  }
  return true
}

function saveAsSVG () {
  if (!paper) { return }

  const fileNameBase = 'voronoi_shelf'

  const time = strftime('%F-%H-%M')
  const fileName = `${fileNameBase}__${time}.svg`
  const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    paper.project.exportSVG({ asString: true })
  )
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  link.remove()
}

export default setUp
