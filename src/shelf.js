import { getStyles, stylesLaser } from './paper_styles.js'

let paper

export function setPaper (ppr) {
  paper = ppr
}

export function drawSideView (edge, {
  materialThickness = 15,
  notchLength,
  connectorCoreRadius
}) {
  const { start, end } = edge
  const styles = getStyles()

  const edgeV = end.point.subtract(start.point)
  const angle = edgeV.angle
  const coreV = edgeV.normalize(connectorCoreRadius)
  const notchV = edgeV.normalize(notchLength)

  const notchRect = new paper.Path.Rectangle({
    point: [0, 0],
    size: [
      edgeV.length - (coreV.length * 2) + (notchV.length * 2),
      materialThickness
    ],
    style: styles.debug
  })
  notchRect.bounds.leftCenter = start.point.add(coreV).subtract(notchV)
  notchRect.rotate(angle, notchRect.bounds.leftCenter)

  const rect = new paper.Path.Rectangle({
    point: [0, 0],
    size: [edgeV.length - (coreV.length * 2), materialThickness],
    style: styles.outline
  })
  rect.bounds.leftCenter = start.point.add(coreV)
  rect.rotate(angle, rect.bounds.leftCenter)

  const g = new paper.Group({ name: `e-${start.label}-${end.label}` })
  g.addChild(notchRect)
  g.addChild(rect)
  return g
}

export function draw (edge, {
  depth,
  materialThickness,
  notchLength,
  connectorCoreRadius,
  laser = true
}) {
  const { start, end } = edge
  const styles = getStyles()

  const edgeL = end.point.subtract(start.point).length
  const outerEdgeL = edgeL - (2 * connectorCoreRadius)
  const notchEdgeL = outerEdgeL + (2 * notchLength)

  const notchRect = new paper.Path.Rectangle({
    point: [0, 0],
    size: [
      notchEdgeL,
      depth - (2 * materialThickness)
    ],
    style: styles.debug
  })

  const outerEdgeRect = new paper.Path.Rectangle({
    point: [20, 20],
    size: [
      outerEdgeL,
      depth
    ],
    style: styles.debug
  })

  notchRect.bounds.center = outerEdgeRect.bounds.center

  const edgePath = notchRect.unite(outerEdgeRect, { insert: true })
  edgePath.style = styles.outline

  const startLabel = new paper.PointText({
    point: outerEdgeRect.bounds.leftCenter,
    content: start.label.toString(),
    style: {
      ...styles.etchText,
      justification: 'center'
    }
  })
  startLabel.bounds.center = outerEdgeRect.bounds.leftCenter

  const endLabel = new paper.PointText({
    point: outerEdgeRect.bounds.rightCenter,
    content: end.label.toString(),
    style: {
      ...styles.etchText,
      justification: 'center'
    }
  })
  endLabel.bounds.center = outerEdgeRect.bounds.rightCenter

  notchRect.remove()
  outerEdgeRect.remove()

  if (laser) {
    edgePath.style = stylesLaser.outline2
    startLabel.strokeColor = stylesLaser.outline1.strokeColor
    endLabel.strokeColor = stylesLaser.outline1.strokeColor
  }

  const g = new paper.Group({ name: `e-${start.label}-${end.label}` })
  g.addChild(edgePath)
  g.addChild(startLabel)
  g.addChild(endLabel)

  return g
}
