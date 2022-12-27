import AsyncStorage from "@react-native-async-storage/async-storage";

class ApplicationStorage {
  static SELECTED_DATES = "selected-dates";

  static async loadSelectedDates(): Promise<number[]> {
    return AsyncStorage.getItem(ApplicationStorage.SELECTED_DATES)
      .catch(console.warn)
      .then((value) => value ?? "[]")
      .then(JSON.parse);
  }

  static async saveSelectedDates(dates: number[]) {
    return AsyncStorage.setItem(
      ApplicationStorage.SELECTED_DATES,
      JSON.stringify(dates)
    ).catch(console.warn);
  }
}

export default ApplicationStorage;
