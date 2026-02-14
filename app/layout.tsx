import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '텍사스 홀덤',
  description: '온라인 텍사스 홀덤 게임',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

