\'use client\'

import { useRef, useState, useEffect, useCallback } from \'react\'
import { useFrame, useThree } from \'@react-three/fiber\'
import { ContactShadows } from \'@react-three/drei\'
import * as THREE from \'three\'
import type { RoomColors } from \'../types\'

/* ── Real-world scale: 1 unit = 1 metre ──────────────────────────────────────
   Room: 4.2m wide × 3.0m tall × 5.0m deep
   Entry door: front wall (z = +2.5), right side
   Left wall (x = -2.1): floor-to-ceiling wardrobe
   Back wall (z = -2.5): study table (wall-mounted, left of centre)
   Bed: centre-right, beside study table
   Dressing table: right side, beside bed
   Right wall (x = +2.1): two windows + balcony door at far end
   Back wall: small window opposite bed
─────────────────────────────────────────────────────────────────────────────*/

interface Props {
  colors: RoomColors
  selectedId: string | null
  onSelect: (id: string) => void
  isNight: boolean
}

// ── Selectable mesh ──────────────────────────────────────────────────────────
interface SelectableProps {
  id: string
  color: string
  onSelect: (id: string) => void
  selectedId: string | null
  children: React.ReactNode
  [key: string]: unknown
}

function S({ id, color, onSelect, selectedId, children, ...props }: SelectableProps) {
  const ref = useRef<THREE.Mesh>(null)
  const [hov, setHov] = useState(false)
  const sel = selectedId === id

  useEffect(() => {
    document.body.style.cursor = hov ? \'pointer\' : \'auto\'
    return () => { document.body.style.cursor = \'auto\' }
  }, [hov])

  return (
    <mesh
      ref={ref}
      {...props}
      onPointerOver={(e) => { e.stopPropagation(); setHov(true) }}
      onPointerOut={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(id) }}
      castShadow
      receiveShadow
    >
      {children}
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.04}
        emissive={sel ? \'#ffffff\' : hov ? \'#cccccc\' : \'#000000\'}
        emissiveIntensity={sel ? 0.10 : hov ? 0.04 : 0}
      />
    </mesh>
  )
}

// ── Room shell ───────────────────────────────────────────────────────────────
function RoomShell({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  const W = 4.2, H = 3.0, D = 5.0, T = 0.12

  return (
    <group>
      {/* Floor */}
      <S id="floor" color={c.floor} onSelect={onSelect} selectedId={sel}
        rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
      </S>
      {/* Ceiling */}
      <S id="ceiling" color={c.ceiling} onSelect={onSelect} selectedId={sel}
        rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
      </S>
      {/* Back wall (z = -2.5) */}
      <S id="walls" color={c.walls} onSelect={onSelect} selectedId={sel}
        position={[0, H / 2, -D / 2]}>
        <boxGeometry args={[W, H, T]} />
      </S>
      {/* Left wall wardrobe backing (x = -2.1) */}
      <S id="walls" color={c.walls} onSelect={onSelect} selectedId={sel}
        position={[-W / 2, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
      </S>
      {/* Right wall – solid except window/door cutouts (handled by window meshes) */}
      <S id="walls" color={c.walls} onSelect={onSelect} selectedId={sel}
        position={[W / 2, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
      </S>
      {/* Front wall left of door */}
      <S id="walls" color={c.walls} onSelect={onSelect} selectedId={sel}
        position={[-0.85, H / 2, D / 2]}>
        <boxGeometry args={[2.5, H, T]} />
      </S>
      {/* Front wall above door */}
      <S id="walls" color={c.walls} onSelect={onSelect} selectedId={sel}
        position={[1.45, 2.55, D / 2]}>
        <boxGeometry args={[1.1, 0.48, T]} />
      </S>
      {/* Skirting boards */}
      {[
        { pos: [0, 0.05, -D / 2 + 0.01] as [number,number,number], args: [W, 0.10, 0.03] as [number,number,number] },
        { pos: [-W / 2 + 0.01, 0.05, 0] as [number,number,number], args: [0.03, 0.10, D] as [number,number,number] },
        { pos: [W / 2 - 0.01, 0.05, 0] as [number,number,number], args: [0.03, 0.10, D] as [number,number,number] },
      ].map((sk, i) => (
        <mesh key={i} position={sk.pos} receiveShadow>
          <boxGeometry args={sk.args} />
          <meshStandardMaterial color="#E8E2DA" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ── Wardrobe (left wall, floor-to-ceiling, almost full wall) ─────────────────
function Wardrobe({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  // 4 sliding-door wardrobe, 0.65m deep, 2.9m tall, 3.8m wide
  const WW = 3.8, WH = 2.95, WD = 0.65

  return (
    <group position={[-2.1 + WD / 2, 0, -0.5]}>
      {/* Carcass body */}
      <S id="wardrobe" color={c.wardrobe} onSelect={onSelect} selectedId={sel}
        position={[0, WH / 2, 0]}>
        <boxGeometry args={[WD, WH, WW]} />
      </S>
      {/* Door panels – 4 panels */}
      {[-1.425, -0.475, 0.475, 1.425].map((z, i) => (
        <group key={i}>
          <S id="wardrobe" color={c.wardrobe} onSelect={onSelect} selectedId={sel}
            position={[WD / 2 + 0.01, WH / 2, z]}>
            <boxGeometry args={[0.03, WH - 0.02, 0.92]} />
          </S>
          {/* Door groove lines */}
          <mesh position={[WD / 2 + 0.025, WH * 0.35, z]}>
            <boxGeometry args={[0.01, WH * 0.55, 0.88]} />
            <meshStandardMaterial color={c.wardrobe} roughness={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[WD / 2 + 0.045, WH * 0.5, z + (i % 2 === 0 ? 0.3 : -0.3)]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 10]} />
            <meshStandardMaterial color={c.wardrobeHandle} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Cornice */}
      <mesh position={[0.02, WH + 0.055, 0]} castShadow>
        <boxGeometry args={[WD + 0.04, 0.11, WW + 0.04]} />
        <meshStandardMaterial color={c.wardrobe} roughness={0.5} />
      </mesh>
      {/* Base plinth */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[WD, 0.12, WW]} />
        <meshStandardMaterial color={c.wardrobe} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── Study table (wall-mounted, back wall left) ───────────────────────────────
function StudyTable({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  return (
    <group position={[-0.9, 0, -2.44]}>
      {/* Wall-mount bracket */}
      <mesh position={[0, 0.74, 0.05]}>
        <boxGeometry args={[1.05, 0.06, 0.08]} />
        <meshStandardMaterial color={c.studyTable} roughness={0.5} />
      </mesh>
      {/* Tabletop */}
      <S id="studyTable" color={c.studyTable} onSelect={onSelect} selectedId={sel}
        position={[0, 0.78, 0.3]}>
        <boxGeometry args={[1.1, 0.04, 0.60]} />
      </S>
      {/* Under-shelf */}
      <S id="studyTable" color={c.studyTable} onSelect={onSelect} selectedId={sel}
        position={[0, 0.56, 0.08]}>
        <boxGeometry args={[1.0, 0.03, 0.35]} />
      </S>
      {/* Monitor */}
      <group position={[0, 1.08, 0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.52, 0.32, 0.03]} />
          <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[0.48, 0.28, 0.001]} />
          <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} roughness={0} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, -0.22, 0.05]} castShadow>
          <boxGeometry args={[0.05, 0.08, 0.05]} />
          <meshStandardMaterial color="#1F2937" roughness={0.4} />
        </mesh>
      </group>
      {/* Keyboard */}
      <mesh position={[0, 0.80, 0.42]} castShadow>
        <boxGeometry args={[0.38, 0.015, 0.13]} />
        <meshStandardMaterial color="#1F2937" roughness={0.5} />
      </mesh>
      {/* Chair */}
      <group position={[0, 0, 0.68]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.48, 0.06, 0.48]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.82, -0.21]} castShadow>
          <boxGeometry args={[0.46, 0.52, 0.06]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
        {[[-0.20, 0.24, -0.20], [0.20, 0.24, -0.20], [-0.20, 0.24, 0.20], [0.20, 0.24, 0.20]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.48, 8]} />
            <meshStandardMaterial color="#374151" roughness={0.5} />
          </mesh>
        ))}
        {/* Wheels */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
          <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// ── Bed (1.6m × 2.1m queen, positioned centre-right) ─────────────────────────
function Bed({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  return (
    <group position={[0.65, 0, -0.85]}>
      {/* Base platform */}
      <S id="bedFrame" color={c.bedFrame} onSelect={onSelect} selectedId={sel}
        position={[0, 0.22, 0]}>
        <boxGeometry args={[1.65, 0.40, 2.15]} />
      </S>
      {/* Headboard */}
      <S id="bedFrame" color={c.bedFrame} onSelect={onSelect} selectedId={sel}
        position={[0, 0.82, -1.00]}>
        <boxGeometry args={[1.65, 0.88, 0.10]} />
      </S>
      {/* Headboard panel detail */}
      <mesh position={[0, 0.82, -0.94]} castShadow>
        <boxGeometry args={[1.45, 0.68, 0.03]} />
        <meshStandardMaterial color={c.bedFrame} roughness={0.4} />
      </mesh>
      {/* Footboard */}
      <S id="bedFrame" color={c.bedFrame} onSelect={onSelect} selectedId={sel}
        position={[0, 0.46, 1.08]}>
        <boxGeometry args={[1.65, 0.30, 0.08]} />
      </S>
      {/* Mattress */}
      <S id="bedsheet" color={c.bedsheet} onSelect={onSelect} selectedId={sel}
        position={[0, 0.45, 0.05]}>
        <boxGeometry args={[1.58, 0.20, 1.98]} />
      </S>
      {/* Duvet / blanket fold */}
      <S id="bedsheet" color={c.bedsheet} onSelect={onSelect} selectedId={sel}
        position={[0, 0.56, 0.30]}>
        <boxGeometry args={[1.56, 0.06, 1.30]} />
      </S>
      {/* Pillows */}
      {[-0.40, 0.40].map((x, i) => (
        <S key={i} id="pillow" color={c.pillow} onSelect={onSelect} selectedId={sel}
          position={[x, 0.57, -0.82]}>
          <boxGeometry args={[0.62, 0.13, 0.42]} />
        </S>
      ))}
      {/* Bedside lamp */}
      <group position={[-1.1, 0.42, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.44, 8]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.49, 0]} castShadow>
          <coneGeometry args={[0.16, 0.22, 12, 1, true]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Legs */}
      {[[-0.78, 0, -1.02], [0.78, 0, -1.02], [-0.78, 0, 1.02], [0.78, 0, 1.02]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 0.06, z]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color={c.bedFrame} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── Dressing table (right side, beside bed) ──────────────────────────────────
function DressingTable({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  return (
    <group position={[1.72, 0, -1.55]}>
      {/* Cabinet body */}
      <S id="dressingTable" color={c.dressingTable} onSelect={onSelect} selectedId={sel}
        position={[0, 0.38, 0]}>
        <boxGeometry args={[0.50, 0.76, 0.85]} />
      </S>
      {/* Top surface */}
      <S id="dressingTable" color={c.dressingTable} onSelect={onSelect} selectedId={sel}
        position={[0, 0.77, 0]}>
        <boxGeometry args={[0.52, 0.04, 0.88]} />
      </S>
      {/* Mirror frame */}
      <mesh position={[0, 1.38, -0.35]} castShadow>
        <boxGeometry args={[0.46, 0.74, 0.04]} />
        <meshStandardMaterial color={c.dressingTable} roughness={0.5} />
      </mesh>
      {/* Mirror glass */}
      <S id="mirror" color={c.mirror} onSelect={onSelect} selectedId={sel}
        position={[0, 1.38, -0.33]}>
        <boxGeometry args={[0.42, 0.70, 0.02]} />
      </S>
      {/* Drawer fronts */}
      {[0.20, -0.20].map((z, i) => (
        <group key={i}>
          <mesh position={[0.26, 0.42, z]}>
            <boxGeometry args={[0.02, 0.28, 0.36]} />
            <meshStandardMaterial color={c.dressingTable} roughness={0.4} />
          </mesh>
          {/* handle */}
          <mesh position={[0.28, 0.42, z]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color={c.wardrobeHandle} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Perfume / accessories */}
      <mesh position={[-0.1, 0.81, -0.2]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, 0.09, 8]} />
        <meshStandardMaterial color="#E8D5B7" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Stool */}
      <group position={[0.6, 0, 0]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.07, 16]} />
          <meshStandardMaterial color="#D6BCAA" roughness={0.9} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((a, i) => (
          <mesh key={i}
            position={[Math.sin(a) * 0.16, 0.19, Math.cos(a) * 0.16]}
            rotation={[Math.cos(a) * 0.28, 0, -Math.sin(a) * 0.28]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.40, 8]} />
            <meshStandardMaterial color="#4A3728" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ── Windows + balcony door (right wall) ─────────────────────────────────────
function Windows({ c, onSelect, sel, isNight }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null; isNight: boolean }) {
  const glass = isNight ? "#050D1A" : "#A8D4F5"
  const glassEmissive = isNight ? "#020810" : "#7EC8E3"
  const glassOpacity = isNight ? 0.96 : 0.38

  return (
    <group>
      {/* Right wall: Window 1 (behind dressing table area) */}
      <group position={[2.09, 1.55, -1.4]}>
        <S id="windowFrame" color={c.windowFrame} onSelect={onSelect} selectedId={sel}
          position={[0, 0, 0]}>
          <boxGeometry args={[0.09, 1.15, 0.92]} />
        </S>
        {/* glass */}
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.04, 1.07, 0.84]} />
          <meshStandardMaterial color={glass} transparent opacity={glassOpacity}
            roughness={0.0} metalness={0.05}
            emissive={glassEmissive} emissiveIntensity={isNight ? 0.05 : 0.18} />
        </mesh>
        {/* cross bars */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.10, 0.03, 0.90]} />
          <meshStandardMaterial color={c.windowFrame} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.10, 1.13, 0.03]} />
          <meshStandardMaterial color={c.windowFrame} roughness={0.5} />
        </mesh>
      </group>

      {/* Right wall: Balcony door (far end near entry) */}
      <group position={[2.09, 1.18, 1.55]}>
        <S id="balconyDoor" color={c.balconyDoor} onSelect={onSelect} selectedId={sel}
          position={[0, 0, 0]}>
          <boxGeometry args={[0.09, 2.20, 1.05]} />
        </S>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.04, 2.12, 0.97]} />
          <meshStandardMaterial color={glass} transparent opacity={glassOpacity}
            roughness={0.0} metalness={0.05}
            emissive={glassEmissive} emissiveIntensity={isNight ? 0.04 : 0.14} />
        </mesh>
        {/* vertical divider */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.10, 2.18, 0.03]} />
          <meshStandardMaterial color={c.balconyDoor} roughness={0.5} />
        </mesh>
        {/* horizontal bar */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.10, 0.03, 1.03]} />
          <meshStandardMaterial color={c.balconyDoor} roughness={0.5} />
        </mesh>
        {/* handle */}
        <mesh position={[-0.06, 0.15, -0.38]}>
          <boxGeometry args={[0.09, 0.03, 0.03]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Back wall: window opposite bed */}
      <group position={[0.80, 1.52, -2.43]}>
        <S id="windowFrame" color={c.windowFrame} onSelect={onSelect} selectedId={sel}
          position={[0, 0, 0]}>
          <boxGeometry args={[0.96, 1.10, 0.09]} />
        </S>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[0.88, 1.02, 0.04]} />
          <meshStandardMaterial color={glass} transparent opacity={glassOpacity}
            roughness={0.0} metalness={0.05}
            emissive={glassEmissive} emissiveIntensity={isNight ? 0.05 : 0.18} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.94, 0.03, 0.10]} />
          <meshStandardMaterial color={c.windowFrame} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 1.08, 0.10]} />
          <meshStandardMaterial color={c.windowFrame} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ── Entry door (front wall right) ────────────────────────────────────────────
function EntryDoor({ c, onSelect, sel }: { c: RoomColors; onSelect: (id: string) => void; sel: string | null }) {
  return (
    <group position={[1.45, 1.05, 2.44]}>
      <S id="doorFrame" color={c.doorFrame} onSelect={onSelect} selectedId={sel}
        position={[0, 0, 0]}>
        <boxGeometry args={[1.05, 2.14, 0.08]} />
      </S>
      {/* Door panel inset */}
      <mesh position={[0, 0.15, 0.02]} castShadow>
        <boxGeometry args={[0.88, 1.6, 0.02]} />
        <meshStandardMaterial color={c.doorFrame} roughness={0.4} />
      </mesh>
      {/* Handle */}
      <mesh position={[-0.38, 0, 0.06]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.11, 10]} rotation={[Math.PI / 2, 0, 0] as unknown as THREE.Euler} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// ── Ceiling light ────────────────────────────────────────────────────────────
function CeilingLight({ isNight }: { isNight: boolean }) {
  return (
    <group position={[0, 2.97, 0]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 0.06, 16]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.13, 16, 8]} />
        <meshStandardMaterial
          color={isNight ? "#FFF9C4" : "#FFFFFF"}
          emissive={isNight ? "#FFD700" : "#FFF5E0"}
          emissiveIntensity={isNight ? 1.0 : 0.3}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

// ── Lighting ─────────────────────────────────────────────────────────────────
function Lighting({ isNight }: { isNight: boolean }) {
  return (
    <>
      {isNight ? (
        <>
          <ambientLight intensity={0.08} color="#1A2744" />
          <pointLight position={[0, 2.82, 0]} intensity={3.5} color="#FFF0C0" distance={9} castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024}
            shadow-camera-near={0.1} shadow-camera-far={12} />
          {/* Bedside lamp glow */}
          <pointLight position={[-0.45, 0.98, -1.35]} intensity={0.8} color="#FF9E40" distance={2.5} />
          {/* Moonlight from windows */}
          <directionalLight position={[4, 3, -2]} intensity={0.18} color="#C4D4FF" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.52} color="#FFF8F0" />
          <directionalLight
            position={[4, 5, 2]} intensity={1.4}
            castShadow
            shadow-mapSize-width={2048} shadow-mapSize-height={2048}
            shadow-camera-near={0.5} shadow-camera-far={20}
            shadow-camera-left={-6} shadow-camera-right={6}
            shadow-camera-top={6} shadow-camera-bottom={-6}
          />
          {/* Sunlight bounce from windows */}
          <pointLight position={[2.0, 2.0, -1.4]} intensity={0.6} color="#FFF0D0" distance={5} />
          <pointLight position={[2.0, 1.8, 1.5]} intensity={0.35} color="#D0EEFF" distance={4} />
          {/* Fill */}
          <pointLight position={[0, 2.7, 0]} intensity={0.4} color="#FFFAE8" distance={7} castShadow />
        </>
      )}
    </>
  )
}

// ── Main exported scene ──────────────────────────────────────────────────────
export default function BedroomScene({ colors, selectedId, onSelect, isNight }: Props) {
  const c = colors
  const sel = selectedId

  return (
    <>
      <Lighting isNight={isNight} />
      <RoomShell c={c} onSelect={onSelect} sel={sel} />
      <Wardrobe c={c} onSelect={onSelect} sel={sel} />
      <StudyTable c={c} onSelect={onSelect} sel={sel} />
      <Bed c={c} onSelect={onSelect} sel={sel} />
      <DressingTable c={c} onSelect={onSelect} sel={sel} />
      <Windows c={c} onSelect={onSelect} sel={sel} isNight={isNight} />
      <EntryDoor c={c} onSelect={onSelect} sel={sel} />
      <CeilingLight isNight={isNight} />
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={isNight ? 0.55 : 0.40}
        scale={12}
        blur={2.0}
        far={4}
        color="#2D1F0E"
      />
    </>
  )
}
