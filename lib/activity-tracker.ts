// lib/activity-tracker.ts
// Simple inactivity logout - logs out user after 30 minutes of no activity

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 min before logout
const ACTIVITY_KEY = 'lastActivityTime';

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let warningTimer: ReturnType<typeof setTimeout> | null = null;
let isInitialized = false;

export interface InactivityCallbacks {
  onWarning?: () => void;
  onLogout: () => void;
}

let callbacks: InactivityCallbacks = {
  onLogout: () => {
    // Default logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      document.cookie = 'access_token=; path=/; max-age=0';
      sessionStorage.setItem('logout_message', 'You have been logged out due to inactivity.');
      window.location.href = '/login';
    }
  }
};

function updateLastActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
  }
}

function getLastActivity(): number {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  }
  return Date.now();
}

function clearTimers() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
}

function startTimers() {
  clearTimers();

  // Warning timer (25 minutes)
  if (callbacks.onWarning) {
    warningTimer = setTimeout(() => {
      const timeSinceActivity = Date.now() - getLastActivity();
      if (timeSinceActivity >= INACTIVITY_TIMEOUT - WARNING_TIME) {
        callbacks.onWarning?.();
      }
    }, INACTIVITY_TIMEOUT - WARNING_TIME);
  }

  // Logout timer (30 minutes)
  inactivityTimer = setTimeout(() => {
    const timeSinceActivity = Date.now() - getLastActivity();
    if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
      console.log('Inactivity timeout - logging out');
      callbacks.onLogout();
    } else {
      // Activity happened, restart timers
      startTimers();
    }
  }, INACTIVITY_TIMEOUT);
}

function handleActivity() {
  updateLastActivity();
  startTimers();
}

export function initInactivityTracker(customCallbacks?: Partial<InactivityCallbacks>) {
  if (typeof window === 'undefined') return () => {};
  
  // Prevent multiple initializations
  if (isInitialized) {
    return () => {};
  }

  if (customCallbacks) {
    callbacks = { ...callbacks, ...customCallbacks };
  }

  // Only initialize if user is logged in
  const token = localStorage.getItem('access_token');
  if (!token) {
    return () => {};
  }

  isInitialized = true;
  updateLastActivity();

  // Throttled activity handler
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  const throttledHandler = () => {
    if (!throttleTimer) {
      handleActivity();
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 1000);
    }
  };

  // Listen for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, throttledHandler, { passive: true });
  });

  // Start initial timers
  startTimers();

  // Return cleanup function
  return () => {
    isInitialized = false;
    clearTimers();
    if (throttleTimer) clearTimeout(throttleTimer);
    events.forEach(event => {
      document.removeEventListener(event, throttledHandler);
    });
  };
}

export function resetInactivityTimer() {
  handleActivity();
}

export function stopInactivityTracker() {
  isInitialized = false;
  clearTimers();
}
