import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dream Team v2.0',
  description: 'ayush bhatt',
  generator: 'devayush402',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
