import type { AppProps } from "next/app"
import { AuthProvider } from "@/contexts/Authcontext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Navbar } from "@/components/Navbar"
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}
