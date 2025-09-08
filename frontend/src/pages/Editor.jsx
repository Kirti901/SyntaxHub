import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CodeBlock from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { api_base_url } from "../helper";
import { toast } from "react-toastify";

const Editor = () => {
  const [code, setCode] = useState("");
  const { id } = useParams();
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [needsInput, setNeedsInput] = useState(false); // <-- toggle visibility

  useEffect(() => {
    fetch(`${api_base_url}/getProject`, {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        projectId: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCode(data.project.code);
          setData(data.project);
          checkInputRequirement(data.project.code);
        } else {
          toast.error(data.msg);
        }
      })
      .catch(() => toast.error("Failed to load project."));
  }, [id]);


  const checkInputRequirement = (codeText) => {
    const inputKeywords = ["cin", "scanf", "gets","input("];
    const requiresInput = inputKeywords.some((kw) =>
      codeText.toLowerCase().includes(kw.toLowerCase())
    );
    setNeedsInput(requiresInput);
  };

  const saveProject = () => {
    const trimmedCode = code?.toString().trim();
    fetch(`${api_base_url}/saveProject`, {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        projectId: id,
        code: trimmedCode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        data.success ? toast.success(data.msg) : toast.error(data.msg);
      })
      .catch(() => toast.error("Failed to save the project."));
  };

  const handleSaveShortcut = (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveProject();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSaveShortcut);
    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [code]);

  const runProject = () => {
  setLoading(true);
  setOutput("");
  setError(false);

  const langMap = {
    "c++": "cpp",
    c: "c",
    python: "python",
    java: "java",
    javascript: "javascript",
    bash: "bash",
  };

  const language = langMap[data?.projLanguage] || "python";

  const extMap = {
    cpp: ".cpp",
    c: ".c",
    python: ".py",
    java: ".java",
    javascript: ".js",
    bash: ".sh",
  };

  const fileName = "main" + (extMap[language] || "");

  fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: language,
      version: data?.version,
      files: [
        {
          name: fileName,
          content: code,
        },
      ],
      stdin: input, 
      args: [],
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result && result.run) {
        setOutput(result.run.output || "");
        setError(result.run.code !== 0);
      } else {
        setOutput(result.message || "Error: No run output received.");
        setError(true);
      }
    })
    .catch(() => {
      setOutput("Error running project.");
      setError(true);
    })
    .finally(() => setLoading(false));
};


  const clearAll = () => {
    setOutput("");
    setInput("");
  };

  return (
    <>
      <Navbar />
      <div
        className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800"
        style={{ height: "calc(100vh - 90px)" }}
      >
        {/* Code Editor */}
        <div className="left w-[50%] h-full border-r border-gray-700">
          <CodeBlock
            onMount={(editor, monaco) => {
              monaco.editor.defineTheme("custom-terminal", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "comment", foreground: "6A9955" },
                  { token: "keyword", foreground: "569CD6" },
                  { token: "string", foreground: "CE9178" },
                ],
                colors: {
                  "editor.background": "#27272a",
                  "editor.foreground": "#ffffff",
                  "editorCursor.foreground": "#ffffff",
                  "editor.lineHighlightBackground": "#3a3a3d",
                  "editorLineNumber.foreground": "#9ca3af",
                  "editorLineNumber.activeForeground": "#ffffff",
                  "editor.selectionBackground": "#3b82f6aa",
                  "editor.inactiveSelectionBackground": "#3b82f655",
                },
              });

              monaco.editor.setTheme("custom-terminal");
            }}
            options={{
              fontSize: 16,
              fontFamily: "Fira Code, monospace",
              lineHeight: 24,
              fontLigatures: true,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
              smoothScrolling: true,
              renderWhitespace: "selection",
              cursorBlinking: "smooth",
              automaticLayout: true,
            }}
            height="100%"
            width="100%"
            language={
              data?.projLanguage === "c++"
                ? "cpp"
                : data?.projLanguage || "python"
            }
            value={code}
            onChange={(newCode) => {
              setCode(newCode || "");
              checkInputRequirement(newCode || "");
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="right w-[50%] h-full bg-[#111] flex flex-col">
  
          <div className="flex items-center justify-between px-4 py-2 bg-[#27272a] border-b border-gray-700">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={runProject}
              >
                Run
              </button>
              <button
                className="px-4 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
                onClick={clearAll}
              >
                Clear
              </button>
            </div>
          </div>

          {/* User Input (visible only if needed) */}
          {needsInput && (
            <div className="p-3 border-b border-gray-700 bg-[#1a1a1a]">
              <label className="block text-gray-400 text-sm mb-1">
                User Input (stdin):
              </label>
              <textarea
                className="w-full px-3 py-2 rounded bg-[#27272a] text-green-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input value .."
              />
            </div>
          )}

          {/* Output Display */}
          <div className="flex-1 overflow-auto bg-[#27272a] p-3 font-mono text-sm text-green-400">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
              </div>
            ) : (
              <pre className={`${error ? "text-red-500" : "text-green-400"}`}>
                {output || "▶ Compile & run to see output here..."}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;
