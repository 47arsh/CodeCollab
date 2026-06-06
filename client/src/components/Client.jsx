import React from "react";

const Client = ({ username }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-lg bg-cyan-300 font-bold text-slate-950">
        {username.charAt(0).toUpperCase()}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {username}
        </p>

        <p className="text-xs text-slate-500">
          You
        </p>
      </div>
    </div>
  );
};

export default Client;