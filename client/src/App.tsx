import React, { useMemo, useState, useEffect } from "react";

// ====== CONFIG: change these 4–5 values ======
const AUTH_URL     = "https://YOUR-FIXIAM/realms/YOUR-REALM/protocol/openid-connect/auth";
const LOGOUT_URL   = "https://YOUR-FIXIAM/realms/YOUR-REALM/protocol/openid-connect/logout";
const CLIENT_ID    = "dummy-sso-demo";
const REDIRECT_URI = "https://YOUR-REPLIT-APP.USERNAME.repl.co/"; // include trailing slash
const SCOPE        = "openid profile email";
// For the simplest first demo we’ll use implicit flow:
const USE_IMPLICIT = true; // keep true for now
// ============================================

function b64UrlToJSON(token: string) {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(
    decodeURIComponent(
      Array.prototype.map
        .call(json, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [claims, setClaims] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);

  useEffect(() => {
    // Handle implicit return (tokens in hash)
    if (!USE_IMPLICIT) return;
    if (!location.hash) return;

    const params = new URLSearchParams(location.hash.slice(1));
    if (params.get("error")) {
      setError(params.get("error_description") || params.get("error") || "Unknown error");
      return;
    }
    const idToken = params.get("id_token");
    if (idToken) {
      try {
        setClaims(b64UrlToJSON(idToken));
      } catch (e: any) {
        setError("Could not decode ID token: " + e?.message);
      }
      // clean URL
      history.replaceState({}, "", REDIRECT_URI);
    }
  }, []);

  const onNext = () => {
    setError(null);
    const state = Math.random().toString(36).slice(2);
    const nonce = Math.random().toString(36).slice(2);

    const u = new URL(AUTH_URL);
    u.searchParams.set("client_id", CLIENT_ID);
    u.searchParams.set("redirect_uri", REDIRECT_URI);
    u.searchParams.set("scope", SCOPE);
    u.searchParams.set("state", state);
    u.searchParams.set("nonce", nonce);
    u.searchParams.set("login_hint", email.trim()); // prefill Syncfix IAM username

    if (USE_IMPLICIT) {
      u.searchParams.set("response_type", "id_token token");
      u.searchParams.set("response_mode", "fragment");
    } else {
      // (PKCE path would go here later)
      u.searchParams.set("response_type", "code");
    }

    window.location.href = u.toString();
  };

  const onLogout = () => {
    const u = new URL(LOGOUT_URL);
    u.searchParams.set("post_logout_redirect_uri", REDIRECT_URI);
    window.location.href = u.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[360px] bg-white border border-gray-200 rounded-xl shadow-md p-6">
        {!claims ? (
          <>
            <div className="text-lg font-semibold mb-1">Microsoft (Demo)</div>
            <h1 className="text-xl font-semibold mb-4">Sign in</h1>

            <label className="text-sm text-gray-600 mb-1 block">
              Email, phone, or Skype
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={onNext}
              disabled={!emailValid}
              className={`mt-4 w-full rounded-lg px-4 py-2 text-white ${
                emailValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Next
            </button>

            <button
              onClick={() => { setEmail(""); setError(null); }}
              className="mt-3 w-full text-blue-600"
            >
              Use another account
            </button>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <p className="mt-4 text-sm text-gray-500">
              This demo routes to Syncfix IAM (FixIAM) and uses <code>login_hint</code> to prefill your email.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-2">Signed in</h1>
            <div className="text-green-700 mb-2">✅ Authentication completed (demo)</div>
            <pre className="text-xs bg-gray-100 border border-dashed border-gray-300 rounded-lg p-3 overflow-auto max-h-80">
{JSON.stringify(claims, null, 2)}
            </pre>
            <button
              onClick={onLogout}
              className="mt-4 w-full rounded-lg px-4 py-2 text-white bg-

