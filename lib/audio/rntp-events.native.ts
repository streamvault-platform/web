import TrackPlayer from "@rntp/player";
import type { Event, EventPayloadByEvent } from "@rntp/player";
import { NativeEventEmitter } from "react-native";
import type { EmitterSubscription, NativeModule } from "react-native";


const emitter = new NativeEventEmitter(TrackPlayer as unknown as NativeModule);

export function subscribeRntpEvent<T extends Event>(
  event: T,
  listener: EventPayloadByEvent[T] extends never
    ? () => void
    : (payload: EventPayloadByEvent[T]) => void
): EmitterSubscription {
  return emitter.addListener(event as string, listener as () => void);
}