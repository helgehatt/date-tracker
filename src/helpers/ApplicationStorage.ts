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
