export const NETWORK_ERROR_MESSAGE = "We couldn't reach ChatReach. Please check your connection and try again.";

type Snapshot = { browserOnline: boolean; apiReachable: boolean };

let state: Snapshot = { browserOnline: true, apiReachable: true };
const listeners = new Set<() => void>();
const serverSnapshot: Snapshot = { browserOnline: true, apiReachable: true };

const update = (patch: Partial<Snapshot>) => {
  const next = { ...state, ...patch };
  if (next.browserOnline === state.browserOnline && next.apiReachable === state.apiReachable) return;
  state = next;
  listeners.forEach((l) => l());
};

let initialised = false;
const init = () => {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  state = { ...state, browserOnline: navigator.onLine };
  window.addEventListener('online', () => update({ browserOnline: true }));
  window.addEventListener('offline', () => update({ browserOnline: false }));
};

export const subscribeConnectivity = (listener: () => void) => {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getConnectivitySnapshot = () => state;
export const getServerConnectivitySnapshot = () => serverSnapshot;

// Called by fetchClient: a rejected fetch means unreachable, any HTTP response means reachable.
export const reportNetworkFailure = () => update({ apiReachable: false });
export const reportNetworkSuccess = () => update({ apiReachable: true, browserOnline: true });
// Some browsers never fire `online`; a successful probe is proof enough.
export const markOnline = () => reportNetworkSuccess();

export const isNetworkErrorMessage = (text?: string) => text === NETWORK_ERROR_MESSAGE;
export const isOffline = () => !state.browserOnline;
