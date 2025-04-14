"use client";
import { useCodeEditorStore } from '@/app/store/useCodeEditorStore';
import React, { useEffect, useState } from 'react'
import { defineMonacoThemes, LANGUAGE_CONFIG } from '../_constant';
import { Editor } from '@monaco-editor/react';
import { RotateCcwIcon, ShareIcon, TypeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import useMounted from '@/hooks/useMounted';
import { EditorPanelSkeleton } from './EdoitorPanelSkeleton';
import ShareSnippetDialog from './ShareSnippetDialog';

const EditorPanel = () => {
  const clerk = useClerk();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const { language, theme, fontSize, editor, setFontSize, setEditor } = useCodeEditorStore();
  const mounted = useMounted();

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`)
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode
    if (editor) editor.setValue(newCode)
  }, [language, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`)
  }
  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  }
  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12))
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString())
  }
  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur-lg rounded-xl border border-white/[0.06] p-6 shadow-md shadow-blue-500/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/10 shadow-inner">
              <Image src={`/${language}.png`} alt="Logo" width={24} height={24} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Code Editor</h2>
              <p className="text-xs text-gray-400">Write and execute your code</p>
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/10 shadow-sm">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer appearance-none accent-cyan-500"
                />
                <span className="text-sm font-medium text-gray-300 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2c2c3a] rounded-lg ring-1 ring-white/10 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400 hover:text-gray-200" />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 transition-all text-white shadow-md"
            >
              <ShareIcon className="size-4" />
              <span className="text-sm font-medium">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded ? (
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          ) : (
            <EditorPanelSkeleton />
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {isShareDialogOpen && <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />}
    </div>
  )
}

export default EditorPanel
