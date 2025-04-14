import { Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const UpgradeButton = () => {
    const CHECKOUT_URL =
        "https://codenova.lemonsqueezy.com/buy/5e456c2a-081d-4b59-8be2-c9e66271d4f4";
    return (
        <Link
            href={CHECKOUT_URL}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white 
    bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg 
    hover:from-cyan-600 hover:to-teal-600 transition-all"
        >
            <Zap className="w-5 h-5" />
            Upgrade to Pro
        </Link>
    )
}

export default UpgradeButton
