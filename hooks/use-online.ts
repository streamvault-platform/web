import { useNetInfo } from "@react-native-community/netinfo";

export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();  
  if (isConnected === false) return false;
  if (isInternetReachable === false) return false;
  return true;
}