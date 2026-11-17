import {
  babloohHeadSvg,
  bombSvg,
  gameOverSvg,
  ninjaGirlSvg,
  ninjaGuySvg,
} from './markups'
import type { SpriteVariant } from './variants'

const MARKUPS: Record<SpriteVariant, string> = {
  guy: ninjaGuySvg,
  girl: ninjaGirlSvg,
  head: babloohHeadSvg,
  bomb: bombSvg,
  sleep: gameOverSvg,
}

/** Create a live SVGElement from markup (stays vector in the DOM). */
export function createSvgElement(variant: SpriteVariant): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(MARKUPS[variant], 'image/svg+xml')
  const svg = parsed.documentElement as unknown as SVGSVGElement
  if (svg.querySelector('parsererror')) {
    throw new Error(`Failed to parse SVG for variant: ${variant}`)
  }
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.display = 'block'
  svg.style.overflow = 'visible'
  return document.importNode(svg, true)
}

export function variantFromIndex(index: number): SpriteVariant {
  const list: SpriteVariant[] = ['guy', 'girl', 'head']
  return list[((index % list.length) + list.length) % list.length]!
}
