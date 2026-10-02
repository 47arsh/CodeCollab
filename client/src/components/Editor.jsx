import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { yCollab } from "y-codemirror.next";

const Editor = ({ language, roomId, codeRef }) => {
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const [sharedExtension, setSharedExtension] = useState(null);

  useEffect(() => {
    if (!roomId) return undefined;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codemirror");
    const provider = new SocketIOProvider(import.meta.env.VITE_BACKEND_URL, roomId, ydoc, {
      autoConnect: true,
    });

    providerRef.current = provider;
    ytextRef.current = ytext;

    const updateCodeRef = () => {
      codeRef.current = ytext.toString();
    };

    ytext.observe(updateCodeRef);
    updateCodeRef();
    setSharedExtension(yCollab(ytext, provider.awareness));

    return () => {
      ytext.unobserve(updateCodeRef);
      provider.destroy();
      ydoc.destroy();
      providerRef.current = null;
      ytextRef.current = null;
      setSharedExtension(null);
    };
  }, [roomId]);

  const languageExtensions = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
  };

  const extensions = useMemo(() => {
    return [languageExtensions[language] || javascript(), sharedExtension].filter(Boolean);
  }, [language, sharedExtension]);

  return (
    <div className="h-full">
      <CodeMirror
        height="100%"
        theme={dracula}
        extensions={extensions}
      />
    </div>
  );
};

export default Editor;