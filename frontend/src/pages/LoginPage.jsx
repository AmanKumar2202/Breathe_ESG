import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Leaf,
  Mail,
  Lock,
} from "lucide-react";

import { useAuth } from "../AuthContext";

export default function LoginPage() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      await login(username, password);

      navigate("/dashboard");

    } catch (err) {

      setError(
        "Invalid credentials. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-10">

          {/* Header */}

          <div className="text-center mb-10">

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-6">

              <Leaf
                size={34}
                className="text-white"
              />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Breathe ESG
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed">
              Enterprise Carbon Intelligence Platform
            </p>
          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Email */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <div className="flex items-center gap-3 border border-slate-200 bg-white rounded-2xl px-4 py-4 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">

                <Mail
                  size={18}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 border border-slate-200 bg-white rounded-2xl px-4 py-4 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">

                <Lock
                  size={18}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Error */}

            {error && (

              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          {/* Demo Credentials */}

          <div className="mt-10 pt-6 border-t border-slate-200">

            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Demo Accounts
            </h3>

            <div className="space-y-3">

              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">
                  Admin
                </p>

                <p className="text-sm font-medium text-slate-800">
                  admin@acme.com
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">
                  Analyst
                </p>

                <p className="text-sm font-medium text-slate-800">
                  analyst@acme.com
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">
                  Auditor
                </p>

                <p className="text-sm font-medium text-slate-800">
                  auditor@acme.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="text-center mt-6">

          <p className="text-sm text-slate-500">
            ESG Reporting & Carbon Accounting System
          </p>
        </div>
      </div>
    </div>
  );
}