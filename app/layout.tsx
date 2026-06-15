import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3D Bedroom Configurator',
  description: 'Interactive 3D bedroom configurator with real-time color customization',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  )
}
