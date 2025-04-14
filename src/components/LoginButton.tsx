import { SignInButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';
import React from 'react';

const LoginButton = () => {
  return (
    <SignInButton mode="modal">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg
               transition-all duration-200 font-medium shadow-lg shadow-cyan-500/20"
      >
        <LogIn className="w-4 h-4 transition-transform" />
        <span>Sign In</span>
      </button>
    </SignInButton>
  );
};

export default LoginButton;
