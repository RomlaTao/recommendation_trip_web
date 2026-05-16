import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { useMyProfile } from '@/features/users/hooks/useMyProfile'

const COVER_PLACEHOLDER = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80'

const showcaseTrips = [
  {
    title: 'Amalfi Coast Escape',
    badge: 'ITALY',
    detail: '7 days exploring Positano, Capri, and hidden coastal caves.',
    img: 'https://images.unsplash.com/photo-1555882932-b23a7c9b37f1?w=600&q=80',
  },
  {
    title: 'Turquoise Serenity',
    badge: 'MALDIVES',
    detail: 'Overwater villas and underwater dining in the Indian Ocean.',
    img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80',
  },
]

const galleryImgs = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
  'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=400&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80',
  null, // "+more" overlay slot
]

export function UserProfileOverview() {
  const { data: profile, isLoading, isError } = useMyProfile()

  if (isLoading) {
    return <div className="py-8 text-center text-on-surface-variant">Loading profile...</div>
  }

  if (isError || !profile) {
    return <Alert variant="error" message="Failed to load user profile." />
  }

  const initials = (profile.username ?? '?')
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div>
      {/* ── Hero — matches UserProfile.html h-[400px] hero section ── */}
      <section className="relative w-full h-[400px] overflow-hidden">
        <img
          src={COVER_PLACEHOLDER}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-scrim/60 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full px-8 pb-12 max-w-[1280px] mx-auto left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-end gap-8">
          {/* Avatar */}
          <div className="relative -mb-4 shrink-0">
            <div className="w-40 h-40 rounded-full border-4 border-on-media overflow-hidden shadow-2xl bg-surface-container-lowest">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container text-3xl font-bold text-on-surface">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Name + bio */}
          <div className="flex-1 mb-4 text-on-media">
            <h1 className="font-display-lg text-display-lg mb-2">{profile.username}</h1>
            <p className="font-body-lg text-body-lg text-on-media/90 max-w-2xl">
              {profile.bio || 'Explorer of hidden gems, lover of slow travel, and curator of vibrant experiences.'}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-4 mb-4 shrink-0">
            <Link
              to="/account/settings"
              className="bg-surface-container-lowest text-primary px-8 py-3 rounded-xl font-label-caps text-label-caps active:scale-95 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              EDIT PROFILE
            </Link>
            <Link
              to="/trips"
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-caps text-label-caps border-b-2 border-on-surface active:scale-95 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">flight_takeoff</span>
              MY TRIPS
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar — matches UserProfile.html stats section ── */}
      <section className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-[1280px] mx-auto px-8 py-8 flex justify-start gap-16">
          {[
            { value: '24', label: 'Trips' },
            { value: '142', label: 'Photos' },
            { value: '38', label: 'Reviews' },
            { value: '1.2k', label: 'Followers' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-headline-lg text-headline-lg text-primary">{s.value}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Content grid — matches UserProfile.html grid-cols-12 ── */}
      <div className="max-w-[1280px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left col: Recent Trips + Reviews */}
        <div className="lg:col-span-8 space-y-12">

          {/* Recent Trips */}
          <div>
            <header className="flex justify-between items-end mb-8">
              <div>
                <span className="text-primary font-label-caps text-label-caps uppercase tracking-tighter">
                  Travel Journey
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Recent Trips</h2>
              </div>
              <Link to="/trips" className="text-primary font-label-caps text-label-caps underline underline-offset-8">
                VIEW ALL
              </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showcaseTrips.map((trip) => (
                <div
                  key={trip.title}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card group"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={trip.img}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-on-media/90 backdrop-blur px-3 py-1 rounded-full font-label-caps text-label-caps text-primary">
                      {trip.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-headline-md text-headline-md mb-2">{trip.title}</h3>
                    <p className="text-on-surface-variant font-body-md mb-6">{trip.detail}</p>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-label-caps text-label-caps active:scale-95 transition-transform">
                        VIEW DETAILS
                      </button>
                      <button className="w-12 h-12 flex items-center justify-center border-2 border-primary rounded-lg group/btn hover:bg-primary transition-colors">
                        <span className="material-symbols-outlined text-primary group-hover/btn:text-on-primary">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="pt-12 border-t border-outline-variant">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-8">Recent Reviews</h2>
            <div className="space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex gap-6">
                <div className="w-16 h-16 bg-surface-container-low rounded-xl flex-shrink-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-4xl">hotel</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline-md text-headline-md">Villa Treville, Positano</h4>
                    <div className="flex text-on-surface">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-4 italic">
                    "An absolute dream. The attention to detail is unmatched, and the views from the terrace are life-changing."
                  </p>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Reviewed 2 weeks ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Gallery + Achievements */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Monochrome Gallery — matches UserProfile.html monochrome-gallery */}
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-6">Gallery</h3>
            <div className="grid grid-cols-2 gap-4">
              {galleryImgs.map((src, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-surface-container-low relative group cursor-pointer">
                  {src ? (
                    <img
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
                      style={{ filter: 'grayscale(100%) contrast(110%)' }}
                      onMouseEnter={(e) => {
                        const img = e.currentTarget
                        img.style.filter = 'grayscale(0%) contrast(100%)'
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget
                        img.style.filter = 'grayscale(100%) contrast(110%)'
                      }}
                    />
                  ) : (
                    <>
                      <img
                        src={galleryImgs[0]!}
                        alt="More photos"
                        className="w-full h-full object-cover"
                        style={{ filter: 'grayscale(100%) contrast(110%)' }}
                      />
                      <div className="absolute inset-0 bg-scrim/40 flex items-center justify-center hover:bg-scrim/60 transition-colors">
                        <span className="font-headline-md text-on-media">+138</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements — matches UserProfile.html black card */}
          <div className="bg-primary text-on-primary p-8 rounded-xl">
            <h3 className="font-label-caps text-label-caps text-on-media/70 uppercase tracking-widest mb-6">
              Achievements
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-on-media/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-media">flight_takeoff</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-on-media">Global Nomad</div>
                  <div className="text-on-media/60 text-xs mt-0.5">Visited 15+ countries in 1 year</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-on-media/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-media">forest</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-on-media">Eco Warrior</div>
                  <div className="text-on-media/60 text-xs mt-0.5">10 sustainable trips completed</div>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 border border-on-media/20 py-3 rounded-lg font-label-caps text-label-caps text-on-media hover:bg-surface-container-lowest hover:text-primary transition-colors">
              VIEW BADGE ROOM
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
