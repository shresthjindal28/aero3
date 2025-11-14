"use client"
import Link from 'next/link'

const sectionLinks = [
  { title: 'Home', href: '#home', id: 'home' },
  { title: 'About', href: '#about', id: 'about' },
  { title: 'Features', href: '#features', id: 'features' },
  { title: 'Pricing', href: '#pricing', id: 'pricing' },
  { title: 'Contact', href: '#contact', id: 'contact' },
]


export default function FooterSection() {
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault()
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <footer className="border-t border-emerald-900/20 bg-gray-950 py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <span className="order-last block text-center text-sm text-gray-400 md:order-first">
            © {new Date().getFullYear()} Curamind, All rights reserved
          </span>

          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            {sectionLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.id)}
                className="group relative block text-gray-300 transition-colors hover:text-emerald-300"
              >
                <span>{link.title}</span>
                <span className="absolute left-0 -bottom-1 h-px w-full origin-center scale-x-0 transform bg-emerald-400 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
