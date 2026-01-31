// lib/activity-tracker.ts
// Tracks user activity to determine inactivity timeout

let lastActivityTime = Date.now();
let inactivityTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let cleanupFunctions: (() => void)[] = [];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // Show warning 5 min before logout

export interface ActivityTrackerCallbacks {
  onInactive: () => void;
  onWarning?: () => void;
}

export function setupActivityTracking(callbacks: ActivityTrackerCallbacks) {
  const { onInactive, onWarning } = callbacks;

  // Events that count as user activity
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  const resetInactivityTimer = () => {
    lastActivityTime = Date.now();

    // Clear existing timers
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }

    // Set warning timer (25 minutes)
    if (onWarning) {
      warningTimer = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivityTime;
        if (inactiveTime >= INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT) {
          onWarning();
        }
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);
    }

    // Set inactivity timer (30 minutes)
    inactivityTimer = setTimeout(() => {
      const inactiveTime = Date.now() - lastActivityTime;

      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        console.log('User inactive for 30 minutes - triggering logout');
        onInactive();
      }
    }, INACTIVITY_TIMEOUT);
  };

  // Throttle activity detection to avoid excessive function calls
  let throttleTimeout: NodeJS.Timeout | null = null;
  const throttledReset = () => {
    if (!throttleTimeout) {
      resetInactivityTimer();
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 1000); // Update at most once per second
    }
  };

  // Attach event listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, throttledReset, { passive: true });
  });

  // Store cleanup function
  const cleanup = () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, throttledReset);
    });
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    if (throttleTimeout) clearTimeout(throttleTimeout);
  };

  cleanupFunctions.push(cleanup);

  // Initial timer setup
  resetInactivityTimer();

  return cleanup;
}

export function getLastActivityTime(): number {
  return lastActivityTime;
}

export function getTimeSinceLastActivity(): number {
  return Date.now() - lastActivityTime;
}

export function isUserActive(): boolean {
  return getTimeSinceLastActivity() < INACTIVITY_TIMEOUT;
}

export function cleanupActivityTracking() {
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions = [];
}
