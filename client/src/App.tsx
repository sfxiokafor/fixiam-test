import React, { useEffect, useMemo, useState } from "react";

const USE_IMPLICIT = true; // Set to false if you want to use authorization code flow instead

const AUTH_URL     = "https://seamfix-sales-demo.stg-iam.seamfix.com/realms/seamfix-sales-demo/protocol/openid-connect/auth";
const LOGOUT_URL   = "https://seamfix-sales-demo.stg-iam.seamfix.com/realms/seamfix-sales-demo/protocol/openid-connect/logout";
const CLIENT_ID    = "dummy-sso-demo";   // or the exact client id you create in FixIAM
const REDIRECT_URI = window.location.origin + "/";   // include trailing slash
const SCOPE        = "openid";


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

// Microsoft Logo Component
function MicrosoftLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      <div style={{ display: "flex", marginRight: 10 }}>
        <div style={{ width: 10, height: 10, backgroundColor: "#f25022", marginRight: 2 }}></div>
        <div style={{ width: 10, height: 10, backgroundColor: "#7fba00" }}></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: 10, height: 10, backgroundColor: "#00a4ef", marginRight: 2 }}></div>
        <div style={{ width: 10, height: 10, backgroundColor: "#ffb900" }}></div>
      </div>
      <span style={{ marginLeft: 10, fontSize: 20, fontWeight: 600, color: "#323130" }}>Microsoft (Demo)</span>
    </div>
  );
}

// Microsoft 365 Home Page Component
function Microsoft365Home({ claims, onLogout }: { claims: any; onLogout: () => void }) {
  const userEmail = claims?.email || claims?.preferred_username || "user@example.com";
  const userInitials = userEmail.split("@")[0].slice(0, 2).toUpperCase();

  const apps = [
    { name: "Outlook", color: "#0078d4", icon: "📧" },
    { name: "Teams", color: "#464775", icon: "💬" },
    { name: "OneDrive", color: "#0078d4", icon: "☁️" },
    { name: "Word", color: "#2b579a", icon: "📄" },
    { name: "Excel", color: "#217346", icon: "📊" },
    { name: "PowerPoint", color: "#d24726", icon: "📋" }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf9f8" }}>
      {/* Top Navigation */}
      <nav style={{ 
        backgroundColor: "#f8f8f8", 
        borderBottom: "1px solid #e1dfdd", 
        padding: "8px 20px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* App Launcher (Waffle) */}
          <button 
            data-testid="button-app-launcher"
            style={{ 
              background: "transparent", 
              border: "none", 
              padding: "8px", 
              cursor: "pointer", 
              marginRight: "12px",
              fontSize: "16px" 
            }}
          >
            ⋮⋮⋮
          </button>
          
          {/* Microsoft 365 Title */}
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#323130" }}>Microsoft 365 (Demo)</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center", maxWidth: "600px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <input
              data-testid="input-search"
              type="text"
              placeholder="Search for apps, files, people, and more"
              style={{
                width: "100%",
                padding: "8px 40px 8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#fff"
              }}
            />
            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {/* User Info */}
          <div style={{ display: "flex", alignItems: "center", marginRight: "16px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#0078d4",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              marginRight: "8px"
            }}>
              {userInitials}
            </div>
            <span data-testid="text-user-email" style={{ fontSize: "14px", color: "#323130" }}>{userEmail}</span>
          </div>
          
          {/* Sign Out Button */}
          <button
            data-testid="button-sign-out"
            onClick={onLogout}
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "#fff",
              color: "#323130",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: "40px 20px" }}>
        {/* Hero Banner */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#323130", margin: 0 }}>Welcome back</h1>
        </div>

        {/* App Grid */}
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "24px",
            justifyItems: "center"
          }}>
            {apps.map((app) => (
              <div 
                key={app.name}
                data-testid={`card-app-${app.name.toLowerCase()}`}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e1dfdd",
                  borderRadius: "8px",
                  padding: "24px",
                  width: "280px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: app.color,
                  borderRadius: "8px",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  {app.icon}
                </div>
                <h3 data-testid={`text-app-name-${app.name.toLowerCase()}`} style={{ 
                  fontSize: "18px", 
                  fontWeight: 600, 
                  color: "#323130", 
                  margin: "0 0 12px" 
                }}>
                  {app.name}
                </h3>
                <button
                  data-testid={`button-open-${app.name.toLowerCase()}`}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #0078d4",
                    borderRadius: "4px",
                    backgroundColor: "#0078d4",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [claims, setClaims] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const onBack = () => {
    setShowPassword(false);
    setError(null);
  };

  // If user is signed in, show Microsoft 365 home page
  if (claims) {
    return <Microsoft365Home claims={claims} onLogout={onLogout} />;
  }

  // Microsoft Login Page Styles
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const containerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  };

  const cardStyle: React.CSSProperties = {
    width: "440px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    padding: "44px",
    textAlign: "center"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    border: "none",
    borderBottom: "2px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "transparent",
    transition: "border-color 0.2s"
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: emailValid ? "#0067b8" : "#a6a6a6",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "2px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: emailValid ? "pointer" : "not-allowed",
    minWidth: "80px"
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    color: "#0067b8",
    border: "1px solid #0067b8",
    padding: "12px 24px",
    borderRadius: "2px",
    fontSize: "15px",
    cursor: "pointer",
    minWidth: "80px",
    marginRight: "12px"
  };

  const linkStyle: React.CSSProperties = {
    color: "#0067b8",
    textDecoration: "none",
    fontSize: "13px",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "4px 0"
  };

  const signInOptionsStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    padding: "16px",
    margin: "20px auto",
    maxWidth: "440px",
    textAlign: "center"
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    textAlign: "center",
    borderTop: "1px solid #e1dfdd"
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <MicrosoftLogo />
          
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1b1a19", margin: "0 0 20px", textAlign: "left" }}>
            Sign in
          </h1>

          {!showPassword ? (
            <>
              <div style={{ textAlign: "left", marginBottom: "24px" }}>
                <input
                  data-testid="input-email"
                  type="email"
                  placeholder="Email, phone, or Skype"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderBottom: error ? "2px solid #d13438" : "2px solid #d1d5db"
                  }}
                  autoComplete="username"
                  onFocus={(e) => e.target.style.borderBottom = "2px solid #0067b8"}
                  onBlur={(e) => e.target.style.borderBottom = error ? "2px solid #d13438" : "2px solid #d1d5db"}
                />
              </div>

              {error && (
                <div data-testid="text-error" style={{ 
                  color: "#d13438", 
                  fontSize: "13px", 
                  textAlign: "left", 
                  marginBottom: "16px" 
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                  <button data-testid="link-create-account" style={linkStyle}>No account? Create one!</button>
                </div>
                <button 
                  data-testid="button-next"
                  onClick={onNext} 
                  disabled={!emailValid} 
                  style={primaryButtonStyle}
                >
                  Next
                </button>
              </div>

              <div style={{ textAlign: "center" }}>
                <button data-testid="link-cant-access" style={linkStyle}>Can't access your account?</button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ textAlign: "left", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#605e5c", marginBottom: "8px" }}>{email}</div>
                <input
                  data-testid="input-password"
                  type="password"
                  placeholder="Password"
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <button data-testid="button-back" onClick={onBack} style={secondaryButtonStyle}>Back</button>
                <button data-testid="button-sign-in" onClick={onNext} style={primaryButtonStyle}>Sign in</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign-in Options Bar */}
      <div style={signInOptionsStyle}>
        <button data-testid="link-sign-in-options" style={{ ...linkStyle, fontSize: "15px" }}>Sign-in options</button>
      </div>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
          <button data-testid="link-terms" style={linkStyle}>Terms of use</button>
          <button data-testid="link-privacy" style={linkStyle}>Privacy & cookies</button>
        </div>
      </footer>
    </div>
  );
}