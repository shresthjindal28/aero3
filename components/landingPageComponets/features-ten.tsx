import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUp, Globe, Play, Plus, Signature, Sparkles } from 'lucide-react'
import Image from 'next/image'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'
const BERNARD_AVATAR = 'https://avatars.githubusercontent.com/u/31113941?v=4'
const THEO_AVATAR = 'https://avatars.githubusercontent.com/u/68236786?v=4'
const GLODIE_AVATAR = 'https://avatars.githubusercontent.com/u/99137927?v=4'

export default function FeaturesSection() {
    return (
        <section id="features" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 text-white px-6 py-24">
            <div className="py-24">
                <div className="mx-auto w-full max-w-3xl px-6">
                    <h2 className="text-foreground text-balance text-3xl font-semibold md:text-4xl text-center">
                        <span className="text-muted-foreground">Advanced tools built to empower</span> <span className=' bg-linear-to-r from-emerald-400 via-white to-emerald-700 bg-clip-text text-transparent special-text'>modern healthcare workflows</span>
                    </h2>

                    <div className="mt-12 grid gap-12 sm:grid-cols-2 place-items-center">

                        {/* Feature 1 */}
                        <div className="col-span-full space-y-4">
                            <Card className="overflow-hidden sm:col-span-2">
                                <div className="mask-b-from-75% -mt-2 w-full sm:max-w-2xl px-1 flex items-center justify-center">
                                    <AIAssistantIllustration />
                                </div>
                            </Card>

                            <div className="max-w-md sm:col-span-3">
                                <h3 className="text-foreground text-lg font-semibold">
                                    Real-Time AI Transcription Assistant
                                </h3>
                                <p className="text-muted-foreground mt-3 text-balance">
                                    Capture every patient conversation instantly. Our assistant listens, 
                                    transcribes, and structures medical notes with exceptional accuracy.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="grid grid-rows-[1fr_auto] space-y-4">
                            <Card className="p-1">
                                <MeetingIllustration />
                            </Card>
                            <div>
                                <h3 className="text-foreground text-lg font-semibold">
                                    Smart Encounter Summaries
                                </h3>
                                <p className="text-muted-foreground mt-3 text-balance">
                                    Automatically generate clean, medically-relevant summaries of each encounter — 
                                    saving clinicians hours of documentation time.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="grid grid-rows-[1fr_auto] space-y-4">
                            <Card className="overflow-hidden p-1">
                                <CodeReviewIllustration />
                            </Card>
                            <div>
                                <h3 className="text-foreground text-lg font-semibold">
                                    AI-Generated Prescription Drafts
                                </h3>
                                <p className="text-muted-foreground mt-3 text-balance">
                                    Our AI analyzes conversations to suggest safe, editable prescription drafts — 
                                    helping clinicians finalize treatment plans faster.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

const MeetingIllustration = () => {
    return (
        <Card aria-hidden className="p-4 bg-gray-950">
            <div className="relative hidden h-fit">
                <div className="absolute -left-1.5 bottom-1.5 rounded-md border-t border-red-700 bg-red-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-red-500/35">PDF</div>
                <div className="h-10 w-8 rounded-md border bg-gradient-to-b from-zinc-100 to-zinc-200"></div>
            </div>

            <div className="mb-0.5 text-sm font-semibold">Patient Summary Review</div>
            <div className="mb-4 flex gap-2 text-sm">
                <span className="text-muted-foreground">Generated 2 min ago</span>
            </div>

            <div className="mb-2 flex -space-x-1.5">
                {[
                    { src: MESCHAC_AVATAR, alt: 'Doctor 1' },
                    { src: BERNARD_AVATAR, alt: 'Doctor 2' },
                    { src: THEO_AVATAR, alt: 'Doctor 3' },
                    { src: GLODIE_AVATAR, alt: 'Doctor 4' },
                ].map((avatar, index) => (
                    <div key={index} className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                        <Image
                            className="aspect-square rounded-full object-cover"
                            src={avatar.src}
                            alt={avatar.alt}
                            height="460"
                            width="460"
                        />
                    </div>
                ))}
            </div>

            <div className="text-muted-foreground text-sm font-medium">Multi-Clinician Collaboration</div>
        </Card>
    )
}

const CodeReviewIllustration = () => {
    return (
        <div aria-hidden className="relative bg-gray-950 rounded-lg">
            <Card className="aspect-video w-4/5 translate-y-2 p-3 bg-gray-950">
                <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
                    <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                        <Image
                            className="aspect-square rounded-full object-cover"
                            src={MESCHAC_AVATAR}
                            alt="Doctor"
                            height="460"
                            width="460"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground line-clamp-1 text-sm font-medium">Dr. Amit Sharma</span>
                        <span className="text-muted-foreground/75 text-xs">Reviewing</span>
                    </div>
                </div>

                <div className="ml-8 space-y-2">
                    <div className="bg-foreground/10 h-2 rounded-full"></div>
                    <div className="bg-foreground/10 h-2 w-3/5 rounded-full"></div>
                    <div className="bg-foreground/10 h-2 w-1/2 rounded-full"></div>
                </div>

                <Signature className="ml-8 mt-3 size-5" />
            </Card>

            <Card className="aspect-3/5 absolute right-0 top-4 flex w-2/5 translate-y-4 p-2 bg-gray-950">
                <div className="bg-foreground/5 m-auto flex size-10 rounded-full">
                    <Play className="fill-foreground/50 stroke-foreground/50 m-auto size-4" />
                </div>
            </Card>
        </div>
    )
}

const AIAssistantIllustration = () => {
    return (
        <Card aria-hidden className="p-4 bg-gray-950 w-full">
            <div className="mx-auto w-fit text-center">
                <p className="border-foreground/5 bg-foreground/5 mb-2 rounded-l-2xl rounded-t-2xl rounded-br border p-4 text-sm">
                    “Patient reports mild chest tightness with occasional cough. No fever.”
                </p>
                <span className="text-muted-foreground block text-right text-xs">Live</span>
            </div>

            <div className="mx-auto w-fit text-center">
                <Sparkles className="size-3.5 fill-purple-300 stroke-purple-300" />
                <p className="mt-2 line-clamp-2 text-sm">
                    Generating structured medical notes using real-time conversation context…
                </p>
            </div>

            <div className="bg-foreground/5 -mx-3 -mb-3 mt-3 space-y-3 rounded-lg p-3">
                <div className="text-muted-foreground text-sm">AI Assistant Tools</div>

                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="size-7 rounded-2xl bg-transparent shadow-none">
                            <Plus />
                        </Button>
                        <Button variant="outline" size="icon" className="size-7 rounded-2xl bg-transparent shadow-none">
                            <Globe />
                        </Button>
                    </div>

                    <Button size="icon" className="size-7 rounded-2xl bg-black">
                        <ArrowUp strokeWidth={3} />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
