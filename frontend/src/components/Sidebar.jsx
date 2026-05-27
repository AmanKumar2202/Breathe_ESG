import React from "react";

import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Database,
  UploadCloud,
  ClipboardList,
  Leaf,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../AuthContext";

export default function Sidebar() {

  const { user } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "Emission Records",
      path: "/records",
      icon: Database,
    },

    ...(user?.role !== "auditor"
      ? [
          {
            name: "Ingest Data",
            path: "/ingest",
            icon: UploadCloud,
          },
        ]
      : []),

    {
      name: "Audit Logs",
      path: "/audit",
      icon: ClipboardList,
    },
  ];

  return (
    <aside className="
      hidden lg:flex
      w-72
      min-h-screen
      flex-col
      justify-between
      bg-slate-950
      border-r border-slate-800
      px-6 py-8
    ">

      {/* Top */}

      <div>

        {/* Brand */}

        <div className="mb-12">

          <div className="
            flex items-center gap-4
            mb-4
          ">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-gradient-to-br
              from-blue-600
              to-emerald-500
              flex items-center justify-center
              shadow-lg shadow-blue-500/20
            ">
              <Leaf
                size={26}
                className="text-white"
              />
            </div>

            <div>

              <h1 className="
                text-2xl
                font-bold
                text-white
                tracking-tight
              ">
                Breathe ESG
              </h1>

              <p className="
                text-sm
                text-slate-400
              ">
                Carbon Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}

        <nav className="space-y-3">

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                    group
                    flex items-center gap-4
                    px-5 py-4
                    rounded-2xl
                    transition-all duration-200
                    border

                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-blue-600
                          to-blue-700
                          border-blue-500
                          text-white
                          shadow-lg
                          shadow-blue-500/20
                        `
                        : `
                          border-transparent
                          text-slate-400
                          hover:bg-slate-900
                          hover:border-slate-800
                          hover:text-white
                        `
                    }
                  `
                }
              >

                <div className="
                  transition-transform duration-200
                  group-hover:scale-110
                ">
                  <Icon size={20} />
                </div>

                <span className="
                  font-medium
                  text-sm
                ">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}

      <div className="
        border border-slate-800
        bg-slate-900/70
        rounded-3xl
        p-5
      ">

        <div className="
          flex items-center gap-3
          mb-4
        ">

          <div className="
            w-12 h-12
            rounded-2xl
            bg-blue-500/10
            text-blue-400
            flex items-center justify-center
          ">
            <ShieldCheck size={22} />
          </div>

          <div>

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-slate-500
              mb-1
            ">
              Logged In As
            </p>

            <h3 className="
              text-sm
              font-semibold
              text-white
            ">
              {user?.role?.toUpperCase()}
            </h3>
          </div>
        </div>

        <div className="
          pt-4
          border-t border-slate-800
        ">

          <p className="
            text-xs
            leading-relaxed
            text-slate-500
          ">
            ESG reporting, emissions tracking,
            audit workflows, and carbon
            intelligence management.
          </p>
        </div>
      </div>
    </aside>
  );
}