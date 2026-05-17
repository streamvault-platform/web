import type { EmitterSubscription } from "react-native";


export function subscribeRntpEvent(
  _event: string,
  _listener: () => void
): EmitterSubscription {
  return { remove: () => {} } as EmitterSubscription;
}