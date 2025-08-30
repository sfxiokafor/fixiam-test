import React, { useEffect, useMemo, useState } from "react";

/* ===================== CONFIG: EDIT THESE ===================== */
const AUTH_URL     = "https://seamfix-sales-demo.stg-iam.seamfix.com/realms/seamfix-sales-demo/protocol/openid-connect/auth";
const LOGOUT_URL   = "https://seamfix-sales-demo.stg-iam.seamfix.com/realms/seamfix-sales-demo/protocol/openid-connect/logout";
const CLIENT_ID    = "dummy-sso-demo"; // (or whatever you registered in FixIAM)
const REDIRECT_URI = "https://<your-app>-<yourusername>.repl.co/"; // your deployed Replit URL with trailing /
const SCOPE        = "openid profile email";
const USE_IMPLICIT = true; // Using implicit flow for demo
/* ============================================================= */

function decodeIdToken(idToken: string) {
  const payload = idToken.split(".")[1];
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

  // Handle implicit return (tokens in URL hash)
  useEffect(() => {
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
        setClaims(decodeIdToken(idToken));
      } catch (e: any) {
        setError("Could not decode ID token: " + e?.message);
      }
      history.replaceState({}, "", REDIRECT_URI); // clean the hash
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
    u.searchParams.set("login_hint", email.trim()); // prefill username in FixIAM

    if (USE_IMPLICIT) {
      u.searchParams.set("response_type", "id_token token");
      u.searchParams.set("response_mode", "fragment");
    } else {
      u.searchParams.set("response_type", "code"); // (PKCE path for later)
    }

    window.location.href = u.toString();
  };

  const onLogout = () => {
    const u = new URL(LOGOUT_URL);
    u.searchParams.set("post_logout_redirect_uri", REDIRECT_URI);
    window.location.href = u.toString();
  };

  // Minimal styling without Tailwind
  const card: React.CSSProperties = { width: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,.06)", padding: 24 };
  const input: React.CSSProperties = { width: "100%", padding: "12px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 };
  const btn: React.CSSProperties = { width: "100%", padding: "11px 16px", borderRadius: 8, border: 0, color: "#fff", background: "#2563eb", cursor: "pointer" };
  const btnDisabled: React.CSSProperties = { ...btn, background: "#9db7f4", cursor: "not-allowed" };
  const link: React.CSSProperties = { color: "#2563eb", background: "transparent", border: 0, cursor: "pointer", padding: 0 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <div style={card}>
        {!claims ? (
          <>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Microsoft (Demo)</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 12px" }}>Sign in</h1>

            <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 6 }}>
              Email, phone, or Skype
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
              autoComplete="username"
            />

            <div style={{ marginTop: 14 }}>
              <button onClick={onNext} disabled={!emailValid} style={emailValid ? btn : btnDisabled}>Next</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => { setEmail(""); setError(null); }} style={link}>Use another account</button>
            </div>

            {error && <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>{error}</div>}

            <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
              This demo routes to Syncfix IAM (FixIAM) and uses <code>login_hint</code> to prefill your email.
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 12px" }}>Signed in</h1>
            <div style={{ color: "#0a7c2f" }}>✅ Authentication completed (demo)</div>
            <pre style={{ marginTop: 12, background: "#f6f7fb", border: "1px dashed #e5e7eb", borderRadius: 8, padding: 10, fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12, maxHeight: 320, overflow: "auto" }}>
{JSON.stringify(claims, null, 2)}
            </pre>
            <div style={{ marginTop: 16 }}>
              <button onClick={onLogout} style={btn}>Logout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}