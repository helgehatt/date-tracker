import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppCategory {
  id: string;
  title: string;
  color: string;
}

export interface AppEvent {
  start: number;
  stop: number;
}

/** https://github.com/DavidAnson/generateRandomUUID/blob/master/generateRandomUUID.js */
export function uuid4() {
  // UUIDs have 16 byte values
  const bytes = new Uint8Array(16);
  // Seed bytes with cryptographically random values
  crypto.getRandomValues(bytes);
  // Set required fields for an RFC 4122 random UUID
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  // Convert bytes to hex and format appropriately
  return Array.prototype.map
    .call(bytes, (b, i) => {
      // Left-pad single-character values with 0,
      // Convert to hexadecimal,
      // Add dashes
      return (
        (b < 16 ? "0" : "") +
        b.toString(16) +
        (i % 2 && i < 10 && i > 2 ? "-" : "")
      );
    })
    .join("");
}

class ApplicationStorage {
  static EVENTS = "events";

  static async loadEvents(): Promise<AppEvent[]> {
    return AsyncStorage.getItem(ApplicationStorage.EVENTS)
      .catch(console.warn)
      .then((value) => value ?? "[]")
      .then(JSON.parse);
  }

  static async saveEvents(events: AppEvent[]) {
    return AsyncStorage.setItem(
      ApplicationStorage.EVENTS,
      JSON.stringify(events)
    ).catch(console.warn);
  }
}

export default ApplicationStorage;
