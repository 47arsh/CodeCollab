import React , {useState} from "react";
import { Link, useParams , useNavigate } from "react-router-dom";
import Client from "../components/Client";
const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Anonymous";
  const [clients, setClients] = useState([
    {
      username,
    },
  ]);
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
          <main className="grid flex-1 gap-4 py-5 lg:grid-cols-[260px_1fr_300px]">

  {/* Left Sidebar */}
  <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">

    {/* Workspace Info */}
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Workspace
      </p>

      <h1 className="mt-2 text-2xl font-black text-white">
        Pair Editor
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Share context, write together, and keep everyone in the same flow.
      </p>
    </div>

    {/* Connected Users */}
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">

      <p className="text-sm font-semibold text-slate-200">
        Connected
      </p>

      <div className="mt-3 space-y-3">

        {clients.map((client, index) => (
          <Client key={index} username={client.username} />
        ))}

      </div>

    </div>

    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3"> 
        <button onClick = {copyRoomId} className="w-full rounded-xl bg-cyan-300 px-6 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/30">
          Copy ROOM-ID
        </button>
    </div>

  </aside>

  {/* Editor Section */}
  <section>

  </section>

  {/* Activity Panel */}
  <aside>

  </aside>

</main>
        </div>

    </div>
  );
};

export default EditorPage;