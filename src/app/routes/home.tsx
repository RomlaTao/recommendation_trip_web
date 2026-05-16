import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import type { FormEvent } from 'react'

const destinationCards = [
  {
    country: 'ITALY',
    title: 'POSITANO GOLD',
    desc: 'Cliffside elegance overlooking the shimmering Tyrrhenian Sea.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxRWYk0UL2FfhgWMILYksaDjH_OXROCvC39eTGhBkaBS0di7fGqFcOXBECxAHDqeSufpUvDKjkmby-Tw7D9l95dERlR1LhXsUZrQgXTQbSDBq8KLt7yMxu9iUrPE61c9pghtS2Es5Q0wgLoo9iSstnrqMk3enUXMr8qcfKd1DCu5SGJAvrscmuIeWVV_WETwSLmYRwj9X_DjBa4h695VcGJOSy8-OYeeVOCwpq95VymNuBvrZLTV_ZpUExHDQT788Y4pn4ASQAGWQ',
  },
  {
    country: 'INDONESIA',
    title: 'UBUD RITUALS',
    desc: 'Spiritual sanctuary nestled within verdant jungle canopies.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1eJkoNCHBCyrXNHPe-Q51ZG_zqo5Bbplz_Z1PNBs5jPko-uIZSy5P11CCyJKtBUJQmph82yIXNQO3gZq4gmyOSNMKmlvhCILeZ_bs8Ai26GOjl8_rtpzfDAinyxaZmU1hp7Jgh4OGeKAPsY_jx5jvCfXJJoHGL50woreIfTUossNZYMUuF1XVuJAJBA1yIKxMVSB2rdZU1EtKDoPgOa4I9L1okz19H_Cli6RUYEHcqCRiqc2BaO9HDjvncPU-dfI5n1ZTuouj6OE',
  },
  {
    country: 'GREECE',
    title: 'OIA HORIZON',
    desc: 'Sun-drenched white-washed architecture meet deep caldera blues.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-oxPh2pAR_FmMQ-3n62IvrgdosHvBK-Fg2M8E8hG0eFI9vQNhVcvnHsFgs0EvXS1kl3NgEiZgxt-_KdxG-OO2Oxot3q4M3AIEpurLyDqJNvRS_v_7jh00pxa_WIbOhTmzES-QTs-e7rVKpeTvvAAEF2Ax7-hiWj7uy0F_UYiJuYCwcqb381y0AuVeYvh0a6FlM0O9QFwRUbcpwt4WXFkXNf-IhS-ouLKWAl5GS6ZoRDH0Z-30UAWp4PBfcMC3ouNB1QNB9KGjT6I',
  },
]

const journalCards = [
  {
    meta: 'GASTRONOMY / 10 MIN',
    title: 'TASTING TRADITION',
    desc: 'The evolution of regional recipes across the Mediterranean coast.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAj59WoJCs6i0VEp3Qh2FIVW3JMIr7cQtp55RrFeGg2L8SC7EyAbedlPR-9GvuY8HHFlk4VQAPNQnDJSOK1CyOz-8P9W2hTJzGr8aiT0i3CQTPyu5G0_Uag_CAVh8Vn-okTJIIAY6Es9aBvJtiZRpv07kcYjOpCao2tken0CCUI0_ivYgcNGJ23Z78EnteAQVe9VL5P6x8xQVgNrGeYBeJm_pDJf_rnQblMsreGOxg9k-QW2TDXHb85dNqved2aZkB3eatOt1T8E5E',
  },
  {
    meta: 'LIFESTYLE / 15 MIN',
    title: 'THE NEW LUXURY',
    desc: 'Why the modern traveler values connection over opulence.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeli0YPhNs_7-yVFHq8Wq4JJHXOLoCr15Fk_YisRDZcYyThT_uKMTAJJASNLyXuAss-MuVjKwxcDmRVftM4ZY87bkjVA2sMDbkfqbKmvQ0W4CxUMxzCuZX8t_VgQrjUtwW-D-08TLgOudoPWBJ7sFIZQD9DgL_Xq9Dl1Z37yTlX1E_fsXL8p6hjs4WI8p0xnj-RCeWinaXt0ldKs4n5QQiLJficVRtbUHbjHmkTxOb36bWovj8djWVG3Pe7LCeDgMSk0qZLIjQbY8',
  },
]

export default function HomeRoute() {
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    const q = searchText.trim()
    if (!q) {
      navigate('/places')
      return
    }
    navigate(`/places?q=${encodeURIComponent(q)}`)
  }

  return (
    <PublicSiteLayout showConcierge>
      <section className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 -z-10">
          <img alt="Hero destination" className="w-full h-full object-cover brightness-[0.95]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRNqrlfTUwaEcRMRBQPvAX429aI_L9KKIfWYjCjQ93ZWTL-doXEbppgtRp9JwTmChsiIkAgKj625Hlybw7DAvhIoQCEzyy0Kkt3idL4Uw0QAFGLBVBIQQ5QA1gsKfENOQkZ4yDf4yDb8tp3fz3Fzjghb1QSUyeW5zzzIXhTL9uxeSRusrEajXD0suDS7NEMOu5Fv3CAJ7yy2R1LnRpSQm4CB-Fh5UOwNcrOmCttIxmFuO5_tgrnEGSFRtNKsMMjz2UNYZR2fcwV4w" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-background/40" />
        </div>
        <div className="text-center px-6 max-w-7xl z-10 flex flex-col items-center">
          <span className="tracking-[0.8em] text-[14px] uppercase mb-12 font-extrabold opacity-90 text-primary">UNFORGETTABLE JOURNEYS AWAIT</span>
          <h1 className="font-display-xl text-primary mb-12 tracking-[-0.05em] leading-[0.9] uppercase font-black text-6xl md:text-7xl lg:text-[90px]">
            THE WORLD IS
            <br />
            YOURS TO EXPLORE
          </h1>
          <form
            onSubmit={handleSearchSubmit}
            className="backdrop-blur-2xl bg-white/70 border border-black/10 w-full max-w-2xl h-16 flex items-center px-8 rounded-full mb-12 shadow-xl"
          >
            <span className="material-symbols-outlined text-primary/60 mr-4">search</span>
            <input
              className="bg-transparent border-none outline-none text-primary w-full placeholder:text-on-surface-variant/50 font-medium tracking-wide text-lg"
              placeholder="Where do you want to go?"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="text-primary/60 hover:text-primary px-2"><span className="material-symbols-outlined text-2xl">search</span></button>
          </form>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/places" className="bg-primary text-on-primary px-14 py-4 font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-secondary shadow-lg">Start Planning</Link>
            <Link to="/places" className="bg-white/80 border border-black/10 text-primary px-14 py-4 font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-white backdrop-blur-md shadow-lg">CHAT WITH PERRY</Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-primary text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block opacity-40">COLLECTIONS</span>
              <h2 className="font-headline-lg text-primary leading-tight">VIBRANT<br />ESCAPES</h2>
            </div>
            <p className="text-on-surface-variant max-w-sm font-medium text-[15px] leading-relaxed">Hand-selected experiences that combine luxury with the soul of the world's most beautiful landscapes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinationCards.map((item) => (
              <article key={item.title} className="group relative aspect-[3/4] overflow-hidden cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" src={item.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-10 flex flex-col justify-end">
                  <span className="text-white/80 text-[9px] font-bold tracking-[0.4em] uppercase mb-2">{item.country}</span>
                  <h3 className="text-white font-headline-md mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-white/90 text-[14px] font-medium">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-12">
          <div className="mb-16">
            <span className="text-primary text-[10px] font-bold tracking-[0.6em] uppercase mb-4 block opacity-40">TRAVEL INSIGHTS</span>
            <h2 className="font-headline-lg text-primary tracking-tight">THE ART OF<br />EXPLORATION</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <article className="space-y-8 group cursor-pointer">
              <div className="aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
                <img alt="Luxury travel scene" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2uCDmcheEMa3HWvjy5_trp4FqGXM9cB_-vFQyh8z-lfpVfdCg5Nlmfs6GWJvmZnTwV5O5IsX_bPgqFvh0Lkt6dsCHsJFqoBhFZy2BaKVftk0V2FNAibhaKWoh6GhfFhmApPJ83atkNrmgJTmmaq70WKSyOthEjv_1Ql8WPPvYyODYiCPIYhANoaj8DnbB7YauHKOTuVSeLkK0RN4Hg07uhkSN41ptksj1qajZKF_lNjIVVxCCsPhldu97M7q1xgGn3STRQU7cznY" />
              </div>
              <div className="space-y-4">
                <span className="text-on-surface-variant text-[9px] uppercase tracking-[0.4em] font-bold">CULTURE / AUGUST 2024</span>
                <h3 className="text-primary font-headline-md leading-[1.2] tracking-tight">THE HIDDEN HARMONY: FINDING SERENITY IN BUSY STREETS</h3>
              </div>
            </article>
            <div className="space-y-10">
              {journalCards.map((j) => (
                <article key={j.title} className="flex gap-8 group cursor-pointer border-b border-black/5 pb-10 hover:border-black/20 transition-colors">
                  <div className="w-32 h-32 shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <img alt={j.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" src={j.image} />
                  </div>
                  <div className="space-y-2 pt-1">
                    <span className="text-on-surface-variant text-[9px] uppercase tracking-[0.3em] font-bold">{j.meta}</span>
                    <h4 className="text-primary text-lg font-bold tracking-tight group-hover:text-secondary transition-colors leading-tight">{j.title}</h4>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed">{j.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white flex flex-col items-center justify-center py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-primary text-[10px] font-bold tracking-[0.6em] uppercase opacity-40">AETHER PRIVILEGE</span>
              <h2 className="font-headline-lg text-primary tracking-tight leading-[1.1] uppercase">UNLIMITED<br />HORIZONS</h2>
            </div>
            <p className="text-[17px] text-on-surface-variant max-w-md font-medium leading-[1.7] tracking-wide">
              Join an elite circle of global explorers. Membership unlocks a seamless world of priority access and bespoke itineraries.
            </p>
            <button className="bg-primary text-on-primary px-16 py-5 font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-secondary transition-all shadow-xl">
              Apply for Membership
            </button>
          </div>
          <div className="relative aspect-square group overflow-hidden rounded-2xl shadow-2xl">
            <img
              alt="Membership visual"
              className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgFybabTOen9ayDMv3s68UbRYr_9NkVog20Wa01FXOsCGRqb08cCWPnNnWZ3F9p9XUMYO_ObYJq9-5484-k2jFg2h3Lth1rJMh3NZEVcRF5KgEof2fyXS0VPNs04iDNxcoIaxGNqrMRprawMF5NxifH-0R_xyR1I-2xHL9dZc7GHGkUP_IggHkSaYmtYrg0JoavTPBQzLMEj5jbG78eP8C5TgXUkC1CHK_GRlCV1OwNMhqXMLWatziR6eFFoc1ZYfbzVTQJ_QOgww"
            />
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
