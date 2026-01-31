// lib/auth-manager.ts
// Manages authentication, token refresh, and inactivity logout

import { setupActivityTracking, getTimeSinceLastActivity, cleanupActivityTracking } from './activity-tracker';

const TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour
const REFRESH_BEFORE_EXPIRY = 10 * 60 * 1000; // Refresh 10 min before expiry
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 min inactivity

let tokenRefreshTimer: NodeJS.Timeout | null = null;
let loginTime: number | null = null;
let refreshRetryCount = 0;
const MAX_REFRESH_RETRIES = 3;

interface AuthManagerCallbacks {
  onInactivityLogout?: () => void;
  onInactivityWarning?: () => void;
  onTokenRefreshFailed?: () => void;
}

let callbacks: AuthManagerCallbacks = {};

export function initializeAuthManager(authCallbacks?: AuthManagerCallbacks) {
  callbacks = authCallbacks || {};
  
  // Check if user is logged in
  const token = localStorage.getItem('access_token');
  if (!token) {
    return; // Not logged in, nothing to manage
  }

  loginTime = Date.now();
  
  // Setup activity tracking
  setupActivityTracking({
    onInactive: handleInactivityLogout,
    onWarning: handleInactivityWarning
  });
  
  // Schedule token refresh
  scheduleTokenRefresh();
  
  console.log('Auth manager initialized - token refresh scheduled');
}

function scheduleTokenRefresh() {
  // Clear existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  // Schedule refresh 10 minutes before expiry (50 minutes from now)
  const refreshIn = TOKEN_LIFETIME - REFRESH_BEFORE_EXPIRY;
  
  tokenRefreshTimer = setTimeout(async () => {
    // Check if user is still active
    const timeSinceActivity = getTimeSinceLastActivity();
    
    if (timeSinceActivity < INACTIVITY_TIMEOUT) {
      // User is active → refresh token
      console.log('User active - attempting token refresh');
      const success = await refreshAccessToken();
      
      if (success) {
        loginTime = Date.now(); // Reset login time
        refreshRetryCount = 0;
        scheduleTokenRefresh(); // Schedule next refresh
      } else {
        handleRefreshFailure();
      }
    } else {
      // User inactive → skip refresh, let inactivity timer handle logout
      console.log('User inactive - skipping token refresh');
    }
  }, refreshIn);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    return false;
  }

  try {
    // Use Supabase auth endpoint to refresh
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.error('Supabase URL not configured');
      return false;
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.status === 401) {
      // Refresh token invalid/expired
      console.error('Refresh token invalid or expired');
      return false;
    }

    if (response.status >= 500) {
      // Server error - retry
      console.error('Server error during token refresh');
      throw new Error('Server error');
    }

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return false;
    }

    const data = await response.json();
    
    // Update tokens in localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600`;
      
      // Supabase rotates refresh tokens
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      console.log('Token refreshed successfully');
      return true;
    }

    return false;

  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // Retry logic for network errors
    if (refreshRetryCount < MAX_REFRESH_RETRIES) {
      refreshRetryCount++;
      console.log(`Retrying token refresh (${refreshRetryCount}/${MAX_REFRESH_RETRIES})...`);
      
      // Retry after delay (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, refreshRetryCount) * 2000));
      return await refreshAccessToken();
    }
    
    return false;
  }
}

function handleRefreshFailure() {
  console.error('Token refresh failed after retries');
  
  if (callbacks.onTokenRefreshFailed) {
    callbacks.onTokenRefreshFailed();
  } else {
    // Default: logout
    handleLogout('Token refresh failed. Please login again.');
  }
}

function handleInactivityWarning() {
  console.log('Inactivity warning triggered');
  
  if (callbacks.onInactivityWarning) {
    callbacks.onInactivityWarning();
  }
}

function handleInactivityLogout() {
  console.log('Logging out due to inactivity');
  
  if (callbacks.onInactivityLogout) {
    callbacks.onInactivityLogout();
  } else {
    // Default: logout with message
    handleLogout('You have been logged out due to inactivity.');
  }
}

function handleLogout(message?: string) {
  // Clear timers
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  
  // Clear activity tracking
  cleanupActivityTracking();
  
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'access_token=; path=/; max-age=0';
  
  // Store message for login page
  if (message) {
    sessionStorage.setItem('logout_message', message);
  }
  
  // Redirect to login
  window.location.href = '/login';
}

export function cleanupAuthManager() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  cleanupActivityTracking();
  loginTime = null;
  refreshRetryCount = 0;
}

export function getAuthStatus() {
  return {
    isLoggedIn: !!localStorage.getItem('access_token'),
    loginTime,
    timeSinceLogin: loginTime ? Date.now() - loginTime : null,
    timeSinceActivity: getTimeSinceLastActivity()
  };
}
