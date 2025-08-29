import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Configuration constants - Replace these with your actual values
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "";
const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL || "";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "";
const SCOPE = "openid profile email";

interface TokenClaims {
  sub?: string;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
  nonce?: string;
  aud?: string;
  iss?: string;
  [key: string]: any;
}

type ViewState = 'login' | 'loading' | 'signedIn';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [tokenClaims, setTokenClaims] = useState<TokenClaims | null>(null);

  // Utility functions
  const generateRandomString = (length: number = 32): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  const base64UrlDecode = (str: string): TokenClaims | null => {
    try {
      // Convert base64url to base64
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with '=' if necessary
      while (str.length % 4) {
        str += '=';
      }
      return JSON.parse(atob(str));
    } catch (e) {
      console.error('Failed to decode base64url:', e);
      return null;
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createMockIdToken = (email: string, nonce: string): string => {
    // Create a mock JWT for demo purposes
    const header = { "alg": "RS256", "typ": "JWT" };
    const payload: TokenClaims = {
      "sub": "demo_user_123",
      "name": "Demo User",
      "email": email,
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + 3600,
      "nonce": nonce,
      "aud": CLIENT_ID,
      "iss": AUTH_URL
    };
    
    // Base64url encode (mock - in real scenario this would be properly signed)
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    return `${encodedHeader}.${encodedPayload}.mock_signature`;
  };

  const simulateAuthResponse = (state: string, nonce: string, email: string) => {
    // This simulates what would happen when the IdP redirects back
    const mockIdToken = createMockIdToken(email, nonce);
    const mockAccessToken = 'mock_access_token_' + generateRandomString(16);
    
    // Simulate the URL hash that would be returned by the IdP
    const hash = `#id_token=${mockIdToken}&access_token=${mockAccessToken}&token_type=Bearer&state=${state}`;
    
    // Update URL hash and handle the response
    window.location.hash = hash;
    handleAuthCallback();
  };

  const handleAuthCallback = () => {
    const hash = window.location.hash;
    
    if (hash && hash.includes('id_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      
      if (idToken) {
        // Parse the ID token
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const payload = base64UrlDecode(tokenParts[1]);
          
          if (payload) {
            // Store tokens
            sessionStorage.setItem('id_token', idToken);
            sessionStorage.setItem('access_token', accessToken || '');
            
            // Set the claims and show signed in state
            setTokenClaims(payload);
            setCurrentView('signedIn');
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      }
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail(value);
    
    if (value && !isValidEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Handle form submission
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!AUTH_URL || !CLIENT_ID || !REDIRECT_URI) {
      alert('Please configure AUTH_URL, CLIENT_ID, and REDIRECT_URI environment variables.');
      return;
    }
    
    if (!isValidEmail(email)) return;
    
    // Show loading state
    setCurrentView('loading');
    
    // Generate state and nonce
    const state = generateRandomString();
    const nonce = generateRandomString();
    
    // Store state and nonce for validation
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    
    // Construct OIDC authorization URL
    const params = new URLSearchParams({
      response_type: 'id_token token',
      response_mode: 'fragment',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state: state,
      nonce: nonce,
      login_hint: email
    });
    
    const authUrl = `${AUTH_URL}?${params.toString()}`;
    
    // In a real implementation, this would redirect to the actual IdP
    // window.location.href = authUrl;
    
    // For demo purposes, simulate a successful auth response
    setTimeout(() => {
      simulateAuthResponse(state, nonce, email);
    }, 2000);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear stored tokens
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_nonce');
    
    // Reset form state
    setEmail('');
    setEmailError('');
    setTokenClaims(null);
    
    if (LOGOUT_URL) {
      // Redirect to logout endpoint
      const logoutParams = new URLSearchParams({
        post_logout_redirect_uri: REDIRECT_URI
      });
      window.location.href = `${LOGOUT_URL}?${logoutParams.toString()}`;
    } else {
      // If no logout URL configured, just show login screen
      setCurrentView('login');
    }
  };

  // Check for existing auth callback on page load
  useEffect(() => {
    if (window.location.hash.includes('id_token=')) {
      handleAuthCallback();
    } else if (sessionStorage.getItem('id_token')) {
      // User is already signed in
      const idToken = sessionStorage.getItem('id_token');
      if (idToken) {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const payload = base64UrlDecode(tokenParts[1]);
          if (payload) {
            setTokenClaims(payload);
            setCurrentView('signedIn');
          }
        }
      }
    }
  }, []);

  const isNextButtonDisabled = !email || !isValidEmail(email);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Microsoft Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-27 h-6 relative">
            <div className="w-27 h-6 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-yellow-500 rounded-sm relative">
              <div className="absolute left-7 top-0.5 text-base font-normal text-foreground">
                Microsoft
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Card */}
        {currentView === 'login' && (
          <Card className="shadow-lg" data-testid="card-login">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-light text-foreground mb-2" data-testid="text-title">
                  Microsoft (Demo)
                </h1>
                <h2 className="text-xl font-light text-foreground" data-testid="text-signin-header">
                  Sign in
                </h2>
              </div>
              
              <form onSubmit={handleNext} className="space-y-4" data-testid="form-email">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email, phone, or Skype
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className="py-3"
                    data-testid="input-email"
                  />
                  {emailError && (
                    <div className="text-red-600 text-sm" data-testid="text-email-error">
                      {emailError}
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isNextButtonDisabled}
                    className="w-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                </div>
                
                <div className="text-center pt-2">
                  <a href="#" className="text-primary text-sm hover:underline" data-testid="link-forgot-username">
                    Forgot my username
                  </a>
                </div>
                
                <div className="text-center">
                  <a href="#" className="text-primary text-sm hover:underline" data-testid="link-signin-options">
                    Sign-in options
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* Loading State */}
        {currentView === 'loading' && (
          <Card className="shadow-lg" data-testid="card-loading">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full mb-4" data-testid="spinner-loading">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="text-foreground" data-testid="text-loading">
                  Redirecting to sign in...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Signed In State */}
        {currentView === 'signedIn' && tokenClaims && (
          <Card className="shadow-lg" data-testid="card-signed-in">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" data-testid="icon-success">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-light text-foreground mb-2" data-testid="text-signed-in-title">
                  Signed in
                </h2>
                <p className="text-muted-foreground text-sm" data-testid="text-welcome">
                  Welcome back!
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-muted rounded-md p-4">
                  <h3 className="font-medium text-foreground mb-2" data-testid="text-claims-header">
                    ID Token Claims:
                  </h3>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-x-auto bg-background p-3 rounded border" data-testid="text-token-claims">
                    {JSON.stringify(tokenClaims, null, 2)}
                  </pre>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full py-3 font-medium"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground" data-testid="link-terms">
              Terms of use
            </a>
            <a href="#" className="hover:text-foreground" data-testid="link-privacy">
              Privacy & cookies
            </a>
          </div>
          <div className="flex justify-center items-center space-x-2 text-xs text-muted-foreground">
            <span>...</span>
            <select className="bg-transparent border-none text-xs" data-testid="select-language">
              <option>English (United States)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
