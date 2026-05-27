import React from "react";

import {
  LogOut,
  User,
  Bell,
  Search,
} from "lucide-react";

import { useAuth } from "../AuthContext";

export default function TopBar() {

  const { user, logout } = useAuth();

  return (
    <header className="
      sticky top-0 z-20
      bg-white/80
      backdrop-blur-xl
      border-b border-slate-200
      px-6 lg:px-10
      py-5
    ">

      <div className="
        flex items-center justify-between
        gap-6
      ">

        {/* Left Side */}

        <div className="
          flex items-center gap-6
          flex-1
        ">

          {/* Search */}

          <div className="
            hidden md:flex
            items-center gap-3
            bg-slate-100
            border border-slate-200
            rounded-2xl
            px-4 py-3
            w-full
            max-w-md
            transition-all duration-200
            focus-within:ring-4
            focus-within:ring-blue-100
            focus-within:border-blue-500
          ">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search emissions, records, jobs..."
              className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-slate-700
                placeholder:text-slate-400
              "
            />
          </div>
        </div>

        {/* Right Side */}

        <div className="
          flex items-center gap-4
        ">

          {/* Notifications */}

          <button className="
            relative
            w-12 h-12
            rounded-2xl
            border border-slate-200
            bg-white
            flex items-center justify-center
            text-slate-500
            hover:text-slate-900
            hover:shadow-md
            transition-all duration-200
          ">

            <Bell size={19} />

            <span className="
              absolute top-3 right-3
              w-2.5 h-2.5
              rounded-full
              bg-red-500
              border-2 border-white
            "></span>
          </button>

          {/* User */}

          <div className="
            hidden sm:flex
            items-center gap-3
            bg-white
            border border-slate-200
            rounded-2xl
            px-4 py-2.5
            shadow-sm
          ">

            <div className="
              w-11 h-11
              rounded-2xl
              bg-gradient-to-br
              from-blue-600
              to-blue-700
              text-white
              flex items-center justify-center
              shadow-lg shadow-blue-500/20
            ">
              <User size={18} />
            </div>

            <div>

              <p className="
                text-xs
                uppercase
                tracking-wide
                text-slate-400
                mb-1
              ">
                Role
              </p>

              <h3 className="
                text-sm
                font-semibold
                text-slate-800
              ">
                {(user?.role || "USER")
                  .toUpperCase()}
              </h3>
            </div>
          </div>

          {/* Logout */}

          <button
            onClick={logout}
            className="
              flex items-center gap-2
              bg-red-50
              border border-red-100
              text-red-600
              hover:bg-red-100
              px-4 py-3
              rounded-2xl
              font-medium
              transition-all duration-200
            "
          >

            <LogOut size={18} />

            <span className="hidden md:block">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}