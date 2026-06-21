/* =========================================================================
   Conversão de cor e unidade para a ponte Figma.
   -------------------------------------------------------------------------
   O Figma só representa cor como RGBA (0–1). Os tokens são oklch. Este módulo
   converte oklch → sRGB (push) e sRGB → oklch (pull de edições divergentes),
   além de unidades rem/em ↔ px/%. As fórmulas oklab↔sRGB seguem CSS Color 4 /
   Björn Ottosson. A conversão é LOSSY para cores fora do gamut sRGB (clamp);
   por isso o pull prefere o valor canônico do token quando o RGBA do Figma
   coincide dentro de tolerância (ver figma-to-tokens.ts).
   ========================================================================= */

export type Rgb = { r: number; g: number; b: number } // 0–1
export type Rgba = { r: number; g: number; b: number; a: number } // 0–1
export type Oklch = { l: number; c: number; h: number; alpha: number } // l 0–1, h graus

/** Parseia "oklch(55% 0.20 240deg)" | "oklch(0% 0 0deg / 0.5)". */
export function parseOklch(input: string): Oklch | null {
  const m = input.trim().match(/^oklch\(\s*([^)]+)\)$/i)
  if (!m) return null
  const [coords, alphaPart] = m[1].split('/').map((s) => s.trim())
  const parts = coords.split(/\s+/)
  if (parts.length < 3) return null
  const l = parsePercentOrNumber(parts[0], true) // 55% -> 0.55
  const c = parseFloat(parts[1])
  const h = parseFloat(parts[2].replace(/deg$/i, '')) || 0
  const alpha = alphaPart != null ? parsePercentOrNumber(alphaPart, false) : 1
  if (Number.isNaN(l) || Number.isNaN(c)) return null
  return { l, c, h, alpha }
}

function parsePercentOrNumber(s: string, percentIsFraction: boolean): number {
  if (s.endsWith('%')) {
    const n = parseFloat(s)
    return percentIsFraction ? n / 100 : n / 100
  }
  return parseFloat(s)
}

/** Formata um Oklch de volta a string CSS no estilo dos tokens. */
export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const lp = round(l * 100, 1)
  const cc = round(c, 3)
  const hh = round(h, 1)
  const base = `oklch(${trimNum(lp)}% ${trimNum(cc)} ${trimNum(hh)}deg`
  return alpha < 1 ? `${base} / ${trimNum(round(alpha, 3))})` : `${base})`
}

const cbrt = (x: number) => Math.cbrt(x)

/** OKLCh → sRGB (gamma-encoded, 0–1), com clamp ao gamut. */
export function oklchToRgb({ l, c, h }: Pick<Oklch, 'l' | 'c' | 'h'>): Rgb {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const L = l_ * l_ * l_
  const M = m_ * m_ * m_
  const S = s_ * s_ * s_

  const lr = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S
  const lg = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S
  const lb = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S

  return {
    r: clamp01(linearToSrgb(lr)),
    g: clamp01(linearToSrgb(lg)),
    b: clamp01(linearToSrgb(lb)),
  }
}

/** sRGB (gamma-encoded, 0–1) → OKLCh. */
export function rgbToOklch({ r, g, b }: Rgb): Pick<Oklch, 'l' | 'c' | 'h'> {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)

  const L = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const M = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const S = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const l_ = cbrt(L)
  const m_ = cbrt(M)
  const s_ = cbrt(S)

  const okl = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const oka = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const okb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const c = Math.hypot(oka, okb)
  let h = (Math.atan2(okb, oka) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: okl, c, h }
}

/** Diferença euclidiana simples entre dois RGB (0–1) — proxy de ΔE para tolerância. */
export function rgbDistance(a: Rgb, b: Rgb): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b)
}

/** true se o oklch cai dentro do gamut sRGB (nenhum canal estourou o clamp). */
export function inSrgbGamut({ l, c, h }: Pick<Oklch, 'l' | 'c' | 'h'>): boolean {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const L = l_ ** 3
  const M = m_ ** 3
  const S = s_ ** 3
  const lr = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S
  const lg = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S
  const lb = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S
  const eps = 1e-4
  return [lr, lg, lb].every((v) => v >= -eps && v <= 1 + eps)
}

function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return s
}
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d
const trimNum = (x: number) => String(x)

/* ---------------------------- Unidades ---------------------------------- */
export const REM_PX = 16

/** "0.75rem" → 12 (px). "16px" → 16. "0" → 0. Retorna null se não numérico. */
export function dimensionToPx(value: string): number | null {
  const v = value.trim()
  if (v === '0') return 0
  let m = v.match(/^(-?[\d.]+)rem$/)
  if (m) return parseFloat(m[1]) * REM_PX
  m = v.match(/^(-?[\d.]+)px$/)
  if (m) return parseFloat(m[1])
  if (/^-?[\d.]+$/.test(v)) return parseFloat(v)
  return null
}

/** px → "Nrem" preservando a unidade de origem. */
export function pxToRem(px: number): string {
  return `${trimNum(round(px / REM_PX, 4))}rem`
}

/** "-0.05em" → -5 (percent). "0" → 0. Retorna null se não for em/number. */
export function emToPercent(value: string): number | null {
  const v = value.trim()
  if (v === '0') return 0
  const m = v.match(/^(-?[\d.]+)em$/)
  if (m) return parseFloat(m[1]) * 100
  if (/^-?[\d.]+$/.test(v)) return parseFloat(v)
  return null
}
