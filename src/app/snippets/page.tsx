"use client";

import { useQuery } from 'convex/react';
import React, { useState } from 'react'
import { api } from '../../../convex/_generated/api';
import SnippetsPageSkeleton from './_components/SnippetsPageSkeleton';
import NavigationHeader from '@/components/NavigationHeader';
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Grid, Layers, Search, Tag, X } from 'lucide-react';
import SnippetCard from './_components/SnippetCard';
import Image from 'next/image';

const Page = () => {
    const snippets = useQuery(api.snippets.getSnippets);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
    const [view, setView] = useState<"grid" | 'list'>('grid');
    // loading state 
    if (snippets === undefined) {
        return (
            <div className='min-h-screen'>
                <NavigationHeader />
                <SnippetsPageSkeleton />
            </div>
        )
    }

    const languages = [...new Set(snippets.map((s) => s.language))]
    const popularLanguages = languages.slice(0, 5);

    const filteredSnippets = snippets.filter((snippet) => {
        const matchesSearch =
            snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.userName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;

        return matchesSearch && matchesLanguage;

    })

    return (
        <div className='min-h-screen bg-[#0a0a0f]'>
            <NavigationHeader />
            <div className='relative max-w-7xl mx-auto px-4 py-12'>
                {/* Hero section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-sm text-gray-400 mb-6"
                    >
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Community Code Library
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 text-transparent bg-clip-text mb-6"
                    >
                        Discover & Share Code Snippets
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 mb-8"
                    >
                        Explore a curated collection of code snippets from the community
                    </motion.p>
                </div>

                {/* Search Section */}
                <div className="relative max-w-5xl mx-auto mb-12 space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-cyan-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search snippets by title, language, or author..."
                                className="w-full pl-12 pr-4 py-4 bg-[#1e1e2e]/80 hover:bg-[#1e1e2e] text-white
                            rounded-xl border border-[#313244] hover:border-[#414155] transition-all duration-200
                            placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
                            <Tag className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-400">Languages:</span>
                        </div>

                        {popularLanguages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang === selectedLanguage ? null : lang)}
                                className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200
                            ${selectedLanguage === lang
                                        ? "text-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-500/50"
                                        : "text-gray-400 hover:text-gray-300 bg-[#1e1e2e] hover:bg-[#262637] ring-1 ring-gray-800"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                <Image src={`/${lang}.png`} alt={lang} width={16} height={16} className="object-contain" />
                                    <span className="text-sm">{lang}</span>
                                </div>
                            </button>
                        ))}

                        {selectedLanguage && (
                            <button
                                onClick={() => setSelectedLanguage(null)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Clear
                            </button>
                        )}

                        <div className="ml-auto flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                {filteredSnippets.length} snippets found
                            </span>

                            {/* View Toggle */}
                            <div className="flex items-center gap-1 p-1 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
                                <button
                                    onClick={() => setView("grid")}
                                    className={`p-2 rounded-md transition-all ${view === "grid"
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"}`
                                    }
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    className={`p-2 rounded-md transition-all ${view === "list"
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"}`
                                    }
                                >
                                    <Layers className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snippets Grid */}
                <motion.div
                    className={`grid gap-6 ${view === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 max-w-3xl mx-auto"
                        }`}
                    layout
                >
                    <AnimatePresence mode="popLayout">
                        {filteredSnippets.map((snippet) => (
                            <SnippetCard key={snippet._id} snippet={snippet} />
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </div>

    )
}

export default Page
