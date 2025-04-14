import { create } from "zustand"
import { CodeEditorState } from "@/types/index"
import { LANGUAGE_CONFIG } from "@/app/(root)/_constant"
import { Monaco } from "@monaco-editor/react"

// function to get the initial state from localstorage or defaults
const getInitialState = () => {
    if (typeof window === "undefined") {
        // server-side rendering fallback 
        return {
            language: "javascript",
            fontSize: 16,
            theme: "vs-dark"
        }
    }
    // Retrieve stored preferences or use defaults 
    const savedLanguage = localStorage.getItem('editor-language') || "javascript";
    const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark'
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;
    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize),
    }
}

// zustand store
export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        // Utility : get current code from Monaco editor instance
        getCode: () => get().editor?.getValue() || "",
        // Set the editor instance and load saved code
        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`code-editor-${get().language}`);
            if (savedCode) editor.setValue(savedCode);
            set({ editor });
        },
        // Updated theme and persist it 
        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme);
            set({ theme });
        },
        // Update font size and persist it
        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({ fontSize });
        },

        // change programming language and saved current code
        setLanguage: (language: string) => {
            const currentCode = get().editor?.getValue();
            if (currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode);
            }

            localStorage.setItem("editor-language", language);

            set({
                language,
                output: "",
                error: null
            });
        },

        // RUn the code using Piston API
        runCode: async () => {
            const { language, getCode } = get()
            const code = getCode();

            if (!code) {
                set({ error: "Please enter some code" })
                return;
            }
            set({ isRunning: true, error: null, output: '' })

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [{ content: code }]
                    })
                })
                const data = await response.json();
                console.log("data back from piston", data)

                // Piston returns an error message
                if (data.message) {
                    set({ error: data.message, executionResult: { code, output: '', error: data.message } })
                    return;
                }

                // compilation errors 
                if (data.compile && data.compile.code !== 0) {
                    const error = data.compile.stderr || data.compile.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: '',
                            error
                        }
                    })
                    return;
                }

                // Runtime Errors
                if (data.run && data.run.code !== 0) {
                    const error = data.run.stderr || data.run.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error
                        }
                    })
                    return;
                }

                // Success
                const output = data.run.output;

                set({
                    output: output.trim(),
                    error: null,
                    executionResult: {
                        code,
                        output: output.trim(),
                        error: null
                    }
                })
            } catch (error) {
                console.log("Error running code", error)
                set({
                    error: "Error running code",
                    executionResult: {
                        code,
                        output: '',
                        error: "Error running code"
                    }
                })
            }
            finally {
                set({ isRunning: false })
            }
        }
    }
})
// Result
export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;