import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
// import { FarcasterProvider } from '../hooks/useFarcaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SignaTrust - Secure Digital Signatures with Blockchain & zkProofs',
  description: 'Experience the most secure and scalable digital signature solution on the market',
  keywords: ['farcaster', 'digital signature', 'blockchain', 'zkProofs'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/* <FarcasterProvider> */}
          {children}
        {/* </FarcasterProvider> */}
      </body>
    </html>
  )
}