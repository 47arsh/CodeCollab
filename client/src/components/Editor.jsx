import React, { useState,useEffect,useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { socket } from "../socket.js";
const Editor = ({language , roomId , codeRef}) => {
  console.log("Editor component rendered with language:", language);

  const [code, setCode] = useState("// Start coding...");
  const editorViewRef = useRef(null);

  useEffect(() => {
    socket.on("code-change", ({ code }) => {
      setCode(code);
      codeRef.current = code;
    });

    return () => {
      socket.off("code-change");
    };
}, []);

    useEffect(() => {
        editorViewRef.current?.focus();
    },[])

  const handleCodeChange = (value) => {
    setCode(value);

    codeRef.current = value;

    socket.emit("code-change", {
      roomId,
      code: value,
    });
    // console.log(code);
  };

  const languageExtensions = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
  };
  return (
    <div className="h-full">
      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[languageExtensions[language] || javascript()]}
        onChange={handleCodeChange}
        onCreateEditor={(editorView) => {
          editorViewRef.current = editorView;
        }
        }
      />
    </div>
  );
};

export default Editor;