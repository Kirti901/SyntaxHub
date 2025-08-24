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

  // To Fetch project data
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
        } else {
          toast.error(data.msg);
        }
      })
      .catch(() => toast.error("Failed to load project."));
  }, [id]);

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
    const versions = {
      python: "3.10.0",
      java: "15.0.2",
      javascript: "18.15.0",
      c: "10.2.0",
      cpp: "10.2.0",
      bash: "5.1.0",
    };

    setLoading(true);
    setOutput(""); 
    setError(false);


    fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: data.projLanguage,
        version: data.version,
        files: [
          {
            name:
              "main" +
              (data.projLanguage === "python"
                ? ".py"
                : data.projLanguage === "java"
                ? ".java"
                : data.projLanguage === "javascript"
                ? ".js"
                : data.projLanguage === "c"
                ? ".c"
                : data.projLanguage === "cpp"
                ? ".cpp"
                : data.projLanguage === "bash"
                ? ".sh"
                : ""),
            content: code,
          },
        ],
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
            language="python"
            value={code}
            onChange={(newCode) => setCode(newCode || "")}
          />
        </div>

        {/* Output screen */}
        <div className="right p-[15px] w-[50%] h-full bg-[#27272a]">
          <div className="flex pb-3 border-b-[1px] border-b-[#1e1e1f] items-center justify-between px-[30px]">
            <p className="p-0 m-0">Output</p>
            <button
              className="btnNormal !w-fit !px-[20px] bg-blue-500 transition-all hover:bg-blue-600"
              onClick={runProject}
            >
              Run
            </button>
          </div>

          {/* to show loader */}
          {loading ? (
            <div className="flex items-center justify-center h-[75vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <pre
              className={`w-full h-[75vh] overflow-auto ${error ? "text-red-500" : ""}`}
              style={{ textWrap: "nowrap" }}
            >
              {output}
            </pre>
          )}
        </div>
      </div>
    </>
  );
};

export default Editor;
