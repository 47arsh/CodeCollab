import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

const Editor = ({language}) => {
    console.log("Editor component rendered with language:", language);
  const [code, setCode] = useState("// Start coding...");

  const handleCodeChange = (value) => {
    setCode(value);
  };

  return (
    <div className="h-full">
      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[javascript()]}
        onChange={handleCodeChange}
      />
    </div>
  );
};

export default Editor;