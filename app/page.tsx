'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ColorPanel from '../components/ColorPanel'
import type { RoomColors } from '../types'
import { DEFAULT_COLORS, ITEM_LABELS } from '../types'

const BedroomScene = dynamic(() => import('../components/BedroomScene'), { ssr: false })

export default function Home() {
  const [colors, setColors] = useState<RoomColors>({ ...DEFAULT_COLORS })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isNight, setIsNight] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const handleSave = useCallback(() => {
    const blob = new Blob([JSON.stringify({ colors, isNight }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bedroom-config.json'
    a.click()
  }, [colors, isNight])

  const handleLoad = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.colors) setColors({ ...DEFAULT_COLORS, ...data.colors })
        if (typeof data.isNight === 'boolean') setIsNight(data.isNight)
      } catch {}
    }
    reader.readAsText(file)
  }, [])

  const handleReset = useCallback(() => {
    setColors({ ...DEFAULT_COLORS })
    setSelectedId(null)
  }, [])

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'bedroom.png'
    a.click()
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setShowPanel(true)
  }, [])

  const panelProps = {
    colors, setColors, selectedId,
    setSelectedId: (id: string) => setSelectedId(id),
    isNight, setIsNight,
    onSave: handleSave, onLoad: handleLoad,
    onReset: handleReset, onScreenshot: handleScreenshot,
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-gray-900 border-r border-white/10 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg">
              🛏
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Room Configurator</h1>
              <p className="text-xs text-white/40">Click any object to customize</p>
            </div>
          </div>
        </div>
        <ColorPanel {...panelProps} />
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [5.5, 3.8, 6.2], fov: 48, near: 0.1, far: 50 }}
          style={{ background: isNight ? '#060A14' : '#B8D4E8' }}
        >
          <Suspense fallback={null}>
            <BedroomScene
              colors={colors}
              selectedId={selectedId}
              onSelect={handleSelect}
              isNight={isNight}
            />
            <OrbitControls
              target={[0, 1.2, 0]}
              maxPolarAngle={Math.PI / 2 - 0.02}
              minPolarAngle={0.15}
              minDistance={2.5}
              maxDistance={14}
              enableDamping
              dampingFactor={0.07}
              rotateSpeed={0.55}
            />
          </Suspense>
        </Canvas>

        {/* Selected badge */}
        {selectedId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <div className="px-4 py-2 rounded-full bg-indigo-600/90 backdrop-blur text-white text-xs font-semibold shadow-xl border border-indigo-400/50">
              {ITEM_LABELS[selectedId as keyof typeof ITEM_LABELS] || selectedId} selected
            </div>
          </div>
        )}

        {/* Mobile top controls */}
        <div className="md:hidden absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button onClick={() => setIsNight(n => !n)}
            className="w-11 h-11 rounded-xl bg-gray-900/90 backdrop-blur border border-white/10 text-lg flex items-center justify-center shadow-xl active:scale-95 transition">
            {isNight ? '☀️' : '🌙'}
          </button>
          <button onClick={handleScreenshot}
            className="w-11 h-11 rounded-xl bg-gray-900/90 backdrop-blur border border-white/10 text-lg flex items-center justify-center shadow-xl active:scale-95 transition">
            📷
          </button>
        </div>

        {/* Mobile hint */}
        {!showPanel && (
          <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur text-white/70 text-xs">
              Tap an object then 🎨 to customize
            </div>
          </div>
        )}

        {/* Mobile FAB */}
        <div className="md:hidden absolute bottom-6 right-4 z-20">
          <button onClick={() => setShowPanel(p => !p)}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center text-2xl transition active:scale-95">
            {showPanel ? '✕' : '🎨'}
          </button>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {showPanel && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          onClick={e => { if (e.target === e.currentTarget) setShowPanel(false) }}
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="bg-gray-900 rounded-t-3xl border-t border-white/10 overflow-y-auto"
            style={{ maxHeight: '82vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <div>
                  <p className="font-bold text-white text-sm">Customize Room</p>
                  <p className="text-xs text-white/40">Tap objects to select</p>
                </div>
              </div>
              <button onClick={() => setShowPanel(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm">
                ✕
              </button>
            </div>
            <ColorPanel {...panelProps} />
          </div>
        </div>
      )}
    </div>
  )
}
