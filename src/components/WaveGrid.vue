<template>
  <div class="wavy-bg" role="presentation" aria-hidden="true">
    <svg
      ref="svg"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      class="wavy-svg"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="0">
          <stop offset="0%" :stop-color="colorA" stop-opacity="1" />
          <stop offset="100%" :stop-color="colorB" stop-opacity="1" />
        </linearGradient>
        <filter id="softBlur" x="0%" y="0%" width="100%" height="100%">
          <feGaussianBlur stdDeviation="24" result="b" />
          <feBlend in="SourceGraphic" in2="b" mode="screen" />
        </filter>
      </defs>

      <!-- draw horizontal lines -->
      <g
        :stroke="`url(#${gradientId})`"
        :stroke-width="strokeWidth"
        fill="none"
        :filter="soften ? 'url(#softBlur)' : null"
      >
        <path
          v-for="(d, i) in horizPaths"
          :key="'h' + i"
          :d="d"
          :opacity="lineOpacity"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      <!-- optionally draw vertical lines (toggle with prop) -->
      <g
        v-if="drawVertical"
        :stroke="`url(#${gradientId})`"
        :stroke-width="strokeWidth"
        fill="none"
        :filter="soften ? 'url(#softBlur)' : null"
      >
        <path
          v-for="(d, i) in vertPaths"
          :key="'v' + i"
          :d="d"
          :opacity="lineOpacity"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

/**
 * FullscreenWavyGrid.vue
 *
 * Props:
 *  - cols, rows: initial grid density
 *  - amplitude: max offset of points
 *  - speed: how fast time progresses
 *  - freq: spatial frequency of waves
 *  - colorA, colorB: gradient colors
 *  - strokeWidth, lineOpacity: visual tuning
 *  - drawVertical: whether to draw vertical family of curves
 *  - soften: apply blur filter for a glow-like look
 */

const props = defineProps({
  cols: { type: Number, default: 18 }, // number of columns for grid points
  rows: { type: Number, default: 12 }, // number of rows for grid points
  amplitude: { type: Number, default: 34 }, // maximum pixel offset
  speed: { type: Number, default: 0.8 }, // animation speed multiplier
  freq: { type: Number, default: 0.9 }, // spatial frequency multiplier
  colorA: { type: String, default: '#4facfe' },
  colorB: { type: String, default: '#00f2fe' },
  strokeWidth: { type: Number, default: 1.6 },
  lineOpacity: { type: Number, default: 0.85 },
  drawVertical: { type: Boolean, default: true },
  soften: { type: Boolean, default: true },
  seed: { type: Number, default: Math.floor(Math.random() * 1000000) }, // for deterministic randomness if wanted
})

const svg = ref(null)
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

const gradientId = `wavyGrad-${Math.abs(props.seed).toString(36)}`

let rafId = null
let t0 = performance.now()

// create grid of control points with random phases
function seededRandom(seed) {
  // simple LCG
  let s = seed >>> 0
  return function () {
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0xffffffff
  }
}
const rnd = seededRandom(props.seed)

function buildPoints(cols, rows) {
  const pts = []
  for (let j = 0; j < rows; j++) {
    const row = []
    for (let i = 0; i < cols; i++) {
      row.push({
        ix: i,
        iy: j,
        phaseX: rnd() * Math.PI * 2,
        phaseY: rnd() * Math.PI * 2,
        phase: rnd() * Math.PI * 2,
      })
    }
    pts.push(row)
  }
  return pts
}

let cols = props.cols
let rows = props.rows
let points = buildPoints(cols, rows)

watch(
  () => props.cols,
  (v) => {
    cols = Math.max(2, Math.floor(v))
    points = buildPoints(cols, rows)
  },
)
watch(
  () => props.rows,
  (v) => {
    rows = Math.max(2, Math.floor(v))
    points = buildPoints(cols, rows)
  },
)
watch(
  () => props.seed,
  (v) => {
    points = buildPoints(cols, rows)
  },
)

// compute paths arrays exposed to template
const horizPaths = ref([])
const vertPaths = ref([])

// helpers to interpolate - we use cubic bezier smoothing between points
function buildPathFromPointArray(arr) {
  // arr is [{x,y}, ...]
  if (arr.length < 2) return ''
  // create smooth path using Catmull-Rom to Bezier conversion
  // formula: for points p0..p3 -> cubic bezier between p1 -> p2
  // when endpoints missing, replicate endpoints
  const pts = arr.slice()
  // ensure at least 4 points by cloning edges
  if (pts.length === 2) {
    // straight line with small curve
    const [a, b] = pts
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
  }
  // prepend and append clones
  pts.unshift(pts[0])
  pts.push(pts[pts.length - 1])
  pts.push(pts[pts.length - 2])

  let d = ''
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2]

    // Catmull-Rom to bezier conversion
    const bp1x = p1.x + (p2.x - p0.x) / 6
    const bp1y = p1.y + (p2.y - p0.y) / 6
    const bp2x = p2.x - (p3.x - p1.x) / 6
    const bp2y = p2.y - (p3.y - p1.y) / 6

    if (i === 1) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `
    }
    d += `C ${bp1x.toFixed(2)} ${bp1y.toFixed(2)}, ${bp2x.toFixed(2)} ${bp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `
  }
  return d.trim()
}

// core function: update paths based on time
function updatePaths(timeMs) {
  const t = ((timeMs - t0) / 1000) * props.speed

  const w = width.value
  const h = height.value
  const amp = props.amplitude
  const freq = props.freq

  const cellW = w / (cols - 1)
  const cellH = h / (rows - 1)

  const horiz = []
  for (let y = 0; y < rows; y++) {
    const rowPts = []
    for (let x = 0; x < cols; x++) {
      const p = points[y][x]
      // wave-like offsets using combination of sines
      const nx = x / (cols - 1)
      const ny = y / (rows - 1)

      // spatial phase based on position to create coherent waves
      const spatial = nx * freq * Math.PI * 2 + ny * freq * Math.PI
      const ox =
        Math.sin(t + p.phase + spatial + p.phaseX) * amp * (0.6 + 0.4 * Math.cos(nx * Math.PI))
      const oy =
        Math.cos(t * 0.9 + p.phase + spatial + p.phaseY) *
        amp *
        (0.6 + 0.4 * Math.sin(ny * Math.PI))

      const cx = x * cellW + ox
      const cy = y * cellH + oy
      rowPts.push({ x: cx, y: cy })
    }
    horiz.push(buildPathFromPointArray(rowPts))
  }

  const vert = []
  if (props.drawVertical) {
    for (let x = 0; x < cols; x++) {
      const colPts = []
      for (let y = 0; y < rows; y++) {
        const p = points[y][x]
        const nx = x / (cols - 1)
        const ny = y / (rows - 1)
        const spatial = nx * freq * Math.PI + ny * freq * Math.PI * 2
        const ox =
          Math.sin(t * 1.1 + p.phase + spatial + p.phaseX) *
          amp *
          (0.5 + 0.5 * Math.cos(ny * Math.PI))
        const oy =
          Math.cos(t * 0.7 + p.phase + spatial + p.phaseY) *
          amp *
          (0.5 + 0.5 * Math.sin(nx * Math.PI))

        const cx = x * cellW + ox
        const cy = y * cellH + oy
        colPts.push({ x: cx, y: cy })
      }
      vert.push(buildPathFromPointArray(colPts))
    }
  }

  horizPaths.value = horiz
  vertPaths.value = vert
}

// animation loop
function loop(now) {
  updatePaths(now)
  rafId = window.requestAnimationFrame(loop)
}

onMounted(() => {
  // initial sizing
  width.value = Math.max(300, Math.round(window.innerWidth * dpr) / dpr)
  height.value = Math.max(200, Math.round(window.innerHeight * dpr) / dpr)
  // initial draw
  updatePaths(performance.now())
  // start RAF
  rafId = window.requestAnimationFrame(loop)

  // handle resize (debounced-ish)
  let resizeTimer = null
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      width.value = Math.max(300, Math.round(window.innerWidth * dpr) / dpr)
      height.value = Math.max(200, Math.round(window.innerHeight * dpr) / dpr)
      // rebuild grid (optional: keep cols/rows same, recompute cell sizes)
      updatePaths(performance.now())
    }, 80)
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    clearTimeout(resizeTimer)
  })
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.wavy-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* allow clicks through the background */
  z-index: -1; /* sits behind page content; adjust if needed */
  overflow: hidden;
  background: var(--background);
}

/* ensure svg fills container */
.wavy-svg {
  display: block;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateZ(0); /* promote to its own layer for smoother anim */
}
</style>
