\'use client\'

import { useEffect, useState, useCallback, useRef } from \'react\'
import type { RoomColors } from \'../types\'
import { ITEM_LABELS, DEFAULT_COLORS } from \'../types\'

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 200, g: 200, b: 200 }
}
function rgbToHex(r: number, g: number, b: number) {
  return \'#\' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, \'0\')).join(\'\')
}

const PALETTES = [
  { name: \'Nordic\',    colors: [\'#E8E0D4\', \'#C8B89A\', \'#2C2C2C\', \'#F0EBE3\', \'#8B7355\'] },
  { name: \'Sage\',      colors: [\'#E8EDE6\', \'#B5C4B0\', \'#3A4A3A\', \'#F4F7F2\', \'#7A9478\'] },
  { name: \'Midnight\',  colors: [\'#1E2330\', \'#2D3450\', \'#C9A84C\', \'#F0EBE3\', \'#4A5580\'] },
  { name: \'Warm Oak\',  colors: [\'#FFF4E6\', \'#C4956A\', \'#4A2C17\', \'#FDEBD0\', \'#8B5E3C\'] },
  { name: \'Blush\',     colors: [\'#FAE8E8\', \'#D4A5A5\', \'#5C2D2D\', \'#FFF0F0\', \'#A06060\'] },
]

interface Props {
  colors: RoomColors
  setColors: React.Dispatch<React.SetStateAction<RoomColors>>
  selectedId: string | null
  setSelectedId: (id: string) => void
  isNight: boolean
  setIsNight: (v: boolean) => void
  onSave: () => void
  onLoad: (f: File) => void
  onReset: () => void
  onScreenshot: () => void
}

export default function ColorPanel({
  colors, setColors, selectedId, setSelectedId,
  isNight, setIsNight, onSave, onLoad, onReset, onScreenshot
}: Props) {
  const activeKey = (selectedId || \'walls\') as keyof RoomColors
  const activeColor = colors[activeKey] || \'#cccccc\'
  const [hexInput, setHexInput] = useState(activeColor)
  const [rgb, setRgb] = useState(hexToRgb(activeColor))
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHexInput(activeColor)
    setRgb(hexToRgb(activeColor))
  }, [activeKey, activeColor])

  const apply = useCallback((hex: string) => {
    setColors(p => ({ ...p, [activeKey]: hex }))
  }, [activeKey, setColors])

  const handleHex = (v: string) => {
    setHexInput(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { apply(v); setRgb(hexToRgb(v)) }
  }

  const handleRgb = (ch: \'r\'|\'g\'|\'b\', v: string) => {
    const n = Math.max(0, Math.min(255, parseInt(v) || 0))
    const next = { ...rgb, [ch]: n }
    setRgb(next)
    const h = rgbToHex(next.r, next.g, next.b)
    setHexInput(h); apply(h)
  }

  const inputCls = \'w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400/50 placeholder-white/30\'
  const btnSm = \'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95\'

  return (
    <div className="flex flex-col gap-5 p-4 text-white">

      {/* Action bar */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setIsNight(!isNight)}
          className={`${btnSm} bg-white/8 hover:bg-white/15 col-span-1 justify-center`}>
          <span className="text-base">{isNight ? \'☀️\' : \'🌙\'}</span>
          <span>{isNight ? \'Day Mode\' : \'Night Mode\'}</span>
        </button>
        <button onClick={onScreenshot}
          className={`${btnSm} bg-white/8 hover:bg-white/15 col-span-1 justify-center`}>
          <span className="text-base">📷</span> Screenshot
        </button>
        <button onClick={onSave}
          className={`${btnSm} bg-indigo-600 hover:bg-indigo-500 col-span-1 justify-center`}>
          <span className="text-base">💾</span> Save Config
        </button>
        <button onClick={() => fileRef.current?.click()}
          className={`${btnSm} bg-white/8 hover:bg-white/15 col-span-1 justify-center`}>
          <span className="text-base">📂</span> Load Config
        </button>
        <button onClick={onReset}
          className={`${btnSm} bg-white/5 hover:bg-white/10 col-span-2 justify-center border border-white/10`}>
          ↺ Reset to Defaults
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onLoad(f); e.target.value = \'\' }} />
      </div>

      {/* Element selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2.5">Select Element</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ITEM_LABELS) as Array<keyof RoomColors>).map(key => (
            <button key={key} onClick={() => setSelectedId(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border
                ${activeKey === key
                  ? \'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105\'
                  : \'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white\'
                }`}>
              <span className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                style={{ background: colors[key] }} />
              {ITEM_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Active element color editor */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl shadow-inner border border-white/10 shrink-0"
            style={{ background: activeColor }} />
          <div>
            <p className="font-semibold text-sm">{ITEM_LABELS[activeKey]}</p>
            <p className="text-xs text-white/40">Tap object in 3D view to select</p>
          </div>
        </div>

        {/* Color wheel */}
        <input type="color" value={activeColor}
          onChange={e => { apply(e.target.value); setHexInput(e.target.value); setRgb(hexToRgb(e.target.value)) }}
          className="w-full h-12 rounded-xl cursor-pointer border-0 bg-transparent" />

        {/* HEX */}
        <div>
          <label className="block text-xs text-white/40 mb-1.5 font-medium">HEX</label>
          <input type="text" value={hexInput} maxLength={7}
            onChange={e => handleHex(e.target.value)}
            className={inputCls} placeholder="#rrggbb" />
        </div>

        {/* RGB */}
        <div className="grid grid-cols-3 gap-2">
          {([\'r\', \'g\', \'b\'] as const).map(ch => (
            <div key={ch}>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase">{ch}</label>
              <input type="number" min={0} max={255} value={rgb[ch]}
                onChange={e => handleRgb(ch, e.target.value)}
                className={`${inputCls} text-center`} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick palettes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2.5">Quick Palettes</p>
        <div className="flex flex-col gap-2">
          {PALETTES.map((pal, pi) => (
            <div key={pi} className="flex items-center gap-2">
              <span className="text-xs text-white/40 w-14 shrink-0">{pal.name}</span>
              <div className="flex gap-1.5">
                {pal.colors.map((pc, ci) => (
                  <button key={ci} onClick={() => apply(pc)} title={pc}
                    className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 hover:border-white/40 transition-all shadow"
                    style={{ background: pc }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
