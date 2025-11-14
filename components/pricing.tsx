import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
    return (
        <section id="pricing" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 text-white px-6 py-24">
            <div className="mx-auto max-w-5xl px-6">

                {/* Header */}
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl special-text bg-linear-to-r from-emerald-400 via-white to-emerald-700 bg-clip-text text-transparent">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-gray-300">
                        Choose a plan that scales with your clinic. Real-time transcription, 
                        AI-powered summaries, and automated documentation — all secure and reliable.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">

                    {/* STARTER PLAN */}
                    <div className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-medium">Starter</h2>
                                <span className="my-3 block text-2xl font-semibold">₹0 / mo</span>
                                <p className="text-muted-foreground text-sm">
                                    Best for clinics testing live transcription.
                                </p>
                            </div>

                            <Button asChild variant="outline" className="w-full">
                                <Link href="/signup">Get Started</Link>
                            </Button>

                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    'Live Transcription (Limited)',
                                    '3 Patient Sessions / Month',
                                    'Basic AI Summaries',
                                    'Secure Cloud Storage (1GB)',
                                    'Email Support'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-3 text-emerald-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* PROFESSIONAL PLAN */}
                    <div className="dark:bg-gray-950/10 border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10">
                        <div className="grid gap-6 sm:grid-cols-2">

                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium">Professional</h2>
                                    <span className="my-3 block text-2xl font-semibold">₹999 / mo</span>
                                    <p className="text-muted-foreground text-sm">
                                        Perfect for growing practices & individual doctors.
                                    </p>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href="/signup">Upgrade Now</Link>
                                </Button>
                            </div>

                            <div>
                                <div className="text-sm font-medium">Includes everything in Starter +</div>

                                <ul className="mt-4 list-outside space-y-3 text-sm">
                                    {[
                                        'Unlimited Live Transcription',
                                        'AI Clinical Notes Generation',
                                        'Draft Prescription Suggestions',
                                        'Patient Encounter Summaries',
                                        'Speaker Detection (Doctor/Patient)',
                                        '10GB Secure Cloud Storage',
                                        'Mobile App Access',
                                        'Faster Processing (2x speed)',
                                        'Priority Email & Chat Support',
                                        'Monthly AI Improvements'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="size-3 text-emerald-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                

            </div>
        </section>
    )
}
