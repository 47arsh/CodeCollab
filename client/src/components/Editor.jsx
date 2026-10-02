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

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    console.log(`[Editor] Initializing Yjs for roomId: "${roomId}", backendUrl: "${backendUrl}"`);

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codemirror");
    const provider = new SocketIOProvider(backendUrl, roomId, ydoc, {
      autoConnect: true,
    });

    console.log(`[Editor] Yjs provider created. Target namespace: "${backendUrl}/yjs|${roomId}"`);

    provider.on("status", ({ status }) => {
      console.log(`[Editor Yjs Provider] Status: "${status}" for room: "${roomId}"`);
    });

    provider.on("synced", (isSynced) => {
      console.log(`[Editor Yjs Provider] Synced: ${isSynced} for room: "${roomId}"`);
    });

    provider.on("connection-error", (err) => {
      console.error(`[Editor Yjs Provider] Connection Error for room "${roomId}":`, err);
    });

    provider.socket.on("connect", () => {
      console.log(`[Editor Yjs Socket] Connected to ${provider.socket.nsp}! Socket ID: ${provider.socket.id}`);
    });

    provider.socket.on("connect_error", (err) => {
      console.error(`[Editor Yjs Socket] Connect Error on ${provider.socket.nsp}:`, err.message);
    });

    provider.socket.on("disconnect", (reason) => {
      console.warn(`[Editor Yjs Socket] Disconnected from ${provider.socket.nsp}:`, reason);
    });

    provider.socket.on("sync-update", (data) => {
      console.log(`[Editor Yjs Socket] Received sync-update (${data?.byteLength || data?.length || 0} bytes)`);
    });

    providerRef.current = provider;
    ytextRef.current = ytext;

    const updateCodeRef = (event) => {
      codeRef.current = ytext.toString();
      console.log(`[Editor Y.Text] Updated codeRef. Current content (${codeRef.current.length} chars):`, JSON.stringify(codeRef.current));
    };

    ytext.observe(updateCodeRef);
    updateCodeRef();
    
    console.log(`[Editor] Attaching yCollab extension for room: "${roomId}"`);
    setSharedExtension(yCollab(ytext, provider.awareness));

    return () => {
      console.log(`[Editor] Cleaning up Yjs provider & ydoc for room: "${roomId}"`);
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