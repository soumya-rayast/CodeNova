import { currentUser } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser';
import React from 'react'
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { Blocks, Code2, Sparkles } from 'lucide-react';
import { SignedIn } from '@clerk/nextjs';
import ThemeSelector from './ThemeSelector';
import LanguageSelector from './LanguageSelector';
import RunButton from './RunButton';
import HeaderProfileBtn from './HeaderProfileBtn';

const Header = async () => {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const user = await currentUser();
    const convexUser = await convex.query(api.users.getUser, {
        userId: user?.id || "",
    })
    return (
        <div className="relative z-10">
            <div className="flex items-center lg:justify-between justify-center bg-[#0a0a0f]/80 backdrop-blur-xl p-6 mb-4 rounded-lg shadow-md shadow-cyan-500/5 border border-gray-800/40">
                {/* Left Section */}
                <div className="hidden lg:flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-cyan-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

                        <div className="relative bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                            <Blocks className="w-6 h-6 text-blue-950 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
                        </div>

                        <div className="flex flex-col">
                            <span className="block text-lg font-semibold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 text-transparent bg-clip-text">
                                CodeNova
                            </span>
                            <span className="block text-xs text-cyan-400/60 font-medium">Interactive Code Editor</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-4">
                        <Link
                            href="/snippets"
                            className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-900/50 hover:bg-cyan-500/10 border border-gray-800 hover:border-cyan-500/40 transition-all duration-300 shadow-md overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
                            <span className="text-sm font-medium relative z-10 group-hover:text-white transition-colors">Snippets</span>
                        </Link>
                    </nav>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <ThemeSelector />
                        <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
                    </div>

                    {!convexUser?.isPro && (
                        <Link
                            href="/pricing"
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 hover:from-cyan-500/20 hover:to-cyan-400/20 transition-all duration-300"
                        >
                            <Sparkles className="w-4 h-4 text-cyan-400 hover:text-cyan-300" />
                            <span className="text-sm font-medium text-cyan-400/90 hover:text-cyan-300">Pro</span>
                        </Link>
                    )}

                    <SignedIn>
                        <RunButton />
                    </SignedIn>

                    {/* Profile Button */}
                    <div className="pl-3 border-l border-gray-800">
                        <HeaderProfileBtn />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Header