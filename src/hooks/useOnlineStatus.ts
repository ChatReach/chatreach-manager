import {
  getConnectivitySnapshot,
  getServerConnectivitySnapshot,
  subscribeConnectivity,
} from '@/lib/connectivity';
import { useSyncExternalStore } from 'react';

const useOnlineStatus = () =>
  useSyncExternalStore(subscribeConnectivity, getConnectivitySnapshot, getServerConnectivitySnapshot);

export default useOnlineStatus;
