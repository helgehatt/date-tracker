import * as SecureStore from "expo-secure-store";

class ApplicationStorage {
  static SELECTED_DATES = "selected-dates";

  static async loadSelectedDates(): Promise<number[]> {
    return SecureStore.getItemAsync(ApplicationStorage.SELECTED_DATES)
      .catch(console.warn)
      .then((value) => value ?? "[]")
      .then(JSON.parse);
  }

  static async saveSelectedDates(dates: number[]) {
    return SecureStore.setItemAsync(
      ApplicationStorage.SELECTED_DATES,
      JSON.stringify(dates)
    ).catch(console.warn);
  }
}

export default ApplicationStorage;
