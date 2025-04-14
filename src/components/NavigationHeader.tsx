import HeaderProfileBtn from "@/app/(root)/_components/HeaderProfileBtn";
import { SignedOut } from "@clerk/nextjs";
import { Blocks, Code2, Sparkles } from "lucide-react";
import Link from "next/link";

function NavigationHeader() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-[#0f172a]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative" aria-label="Go to homepage">
              {/* logo hover effect */}
              <div
                className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg opacity-0 
              group-hover:opacity-100 transition-all duration-500 blur-xl"
              />

              {/* Logo */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                <Blocks className="w-6 h-6 text-cyan-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
              </div>

              <div className="relative">
                <span
                  className="block text-lg font-semibold bg-gradient-to-r
                 from-cyan-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text"
                >
                  CodeNova
                </span>
                <span className="block text-xs text-cyan-400/60 font-medium">
                  Interactive Code Editor
                </span>
              </div>
            </Link>

            {/* Snippets Link */}
            <Link
              href="/snippets"
              className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 hover:bg-cyan-500/10 
              border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 shadow-lg overflow-hidden"
              aria-label="Go to Snippets"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 
              to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span className="text-sm font-medium relative z-10 group-hover:text-white transition-colors">
                Snippets
              </span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-cyan-500/20
                 hover:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 
                to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all 
                duration-300"
                aria-label="Go to Pricing"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 hover:text-cyan-300" />
                <span className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
                  Pro
                </span>
              </Link>
            </SignedOut>

            {/* Profile button */}
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavigationHeader;
