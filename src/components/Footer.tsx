import { Blocks } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#0f172a] text-gray-300 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Left Section - Logo and Slogan */}
                    <div className="flex items-center gap-2 text-gray-300">
                        <Blocks className="w-6 h-6 text-cyan-500" />
                        <span className="font-semibold text-white">CodeNova</span>
                        <span>— Built for developers, be developer</span>
                    </div>

                    {/* Right Section - Links */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <Link href="/support" className="text-gray-300 hover:text-cyan-400 transition-colors">
                            Support
                        </Link>
                        <Link href="/privacy" className="text-gray-300 hover:text-cyan-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-gray-300 hover:text-cyan-400 transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <span>&copy; {new Date().getFullYear()} CodeNova. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
