import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  heroImage?: string
  heroTitle?: string
  heroSubtitle?: string
}

const DEFAULT_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl6Cf6nr3osIX2M3vhatMCTDRxLfUPyYxHTL2hA9-cXJXUYoB-NkgfirZyRQAyADrlrcVIqJ3x8NBV09eeJ4a7win-_HaEIse_TWEm_7gfONTNRHsWDGfNScu8A75z2PEae4TCecIl95vAv93ieM3yt0rU9qO3T4C8ulBhBBLkBzfhF-hW4EPMCGHZMIuIyx-l8C679EIpSRv2Oeyg-QO0afxE3At3LqHdEFa4lxxtjJylLE9Y6BrtwnkW5-84J2RhweUKFCAqduU'

export function AuthLayout({
  children,
  heroImage = DEFAULT_HERO,
  heroTitle = 'The horizon is yours.',
  heroSubtitle = 'Redefining the essence of travel through architectural silence and curated experiences.',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Brand name */}
        <div className="absolute top-12 left-12 z-50 text-2xl font-bold tracking-[0.3em] text-primary md:text-on-media select-none">
          BUILDTRIP
        </div>

        {/* Left: hero image */}
        <section className="relative w-full md:w-1/2 h-64 md:h-screen overflow-hidden">
          <div className="absolute inset-0 bg-scrim/20 z-10" />
          <img
            src={heroImage}
            alt="BuildTrip Experience"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-12 left-12 z-20 max-w-md hidden md:block">
            <h2 className="text-on-media font-display-xl text-display-xl mb-4">{heroTitle}</h2>
            <p className="text-on-media/80 font-body-lg text-body-lg">{heroSubtitle}</p>
          </div>
        </section>

        {/* Right: form */}
        <section className="w-full md:w-1/2 min-h-screen bg-surface-container-lowest flex items-center justify-center px-margin-edge py-stack-lg">
          <div className="w-full max-w-md space-y-stack-md">{children}</div>
        </section>
      </main>

      <footer className="w-full bg-footer border-t border-on-footer/15 py-12 px-6 flex flex-col md:flex-row justify-center items-center gap-8">
        <div className="font-label-caps text-[11px] tracking-wider uppercase text-on-footer/70">
          BUILDTRIP © {new Date().getFullYear()}
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {['Privacy & Legal', 'Contact', 'About'].map((link) => (
            <a
              key={link}
              href="#"
              className="font-label-caps text-[11px] tracking-wider uppercase text-on-footer/70 hover:text-on-footer transition-colors duration-300 opacity-80 hover:opacity-100"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
