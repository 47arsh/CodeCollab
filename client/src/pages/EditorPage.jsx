import React from "react";
import { Link, useParams , useNavigate } from "react-router-dom";

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Anonymous";

  const copyRoomId = async() => {
    try{
      await navigator.clipboard.writeText(roomId)
      // toast.success('Room ID copied to clipboard')
      console.log("Room ID copied to clipboard:", roomId)
    }
    catch(err){
      console.error("Failed to copy room ID:", err)
    }
  }

  const leaveRoom = () => {
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#164e63_0,#0f172a_34%,#07111f_72%)] px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 py-2">
            <Link to="/" className="flex items-center gap-3 text-left" >
              <span className="grid size-10 place-items-center rounded-lg bg-cyan-400 font-mono text-lg font-black text-slate-950 shadow-lg shadow-cyan-400/20">
                CC
              </span>
              <span>
                <span className="block text-base font-semibold tracking-wide text-white">CodeCollab</span>
                <span className="block text-xs font-medium text-cyan-200/80">Realtime coding rooms</span>
              </span>
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 shadow-sm backdrop-blur sm:inline-flex">
                Secure shared editor
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 shadow-sm backdrop-blur">
                Live Session
              </span>
              <button onClick={copyRoomId} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 shadow-sm backdrop-blur">
                Copy ROOM-ID
              </button>
              <button onClick={leaveRoom} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 shadow-sm backdrop-blur">
                Leave Room
              </button>
            </div>  
          </header>   
        </div>

    </div>
  );
};

export default EditorPage;