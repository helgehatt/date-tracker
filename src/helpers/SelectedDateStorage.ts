import * as SecureStore from "expo-secure-store";

class SelectedDateStorage {
  static PREFIX = "selected-dates";
  keys: Set<string>;

  constructor() {
    this.keys = new Set();
  }

  async load() {
    const keys = await SelectedDateStorage.loadKeys();
    console.log(`Loading selected dates: [${keys}]`);

    const tasks = keys.map((key) => SelectedDateStorage.loadMonth(key));

    const result = await Promise.all(tasks);

    keys.forEach((key) => this.keys.add(key));

    return result.flat();
  }

  async save(date: Date, dates: Set<number>) {
    const key = date.toISOMonthString();
    await SelectedDateStorage.saveMonth(key, dates);
    if (!this.keys.has(key)) {
      this.keys.add(key);
      await SelectedDateStorage.saveKeys(this.keys);
    } else if (dates.size == 0) {
      this.keys.delete(key);
      await SelectedDateStorage.saveKeys(this.keys);
    }
  }

  static async loadKeys() {
    try {
      const value = await SecureStore.getItemAsync(`${this.PREFIX}-keys`);
      if (value) {
        return JSON.parse(value) as string[];
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  static async loadMonth(month: string) {
    try {
      const value = await SecureStore.getItemAsync(`${this.PREFIX}-${month}`);
      if (value) {
        const parsed = JSON.parse(value) as number[];
        return parsed
          .map((value) => String(value).padStart(2, "0"))
          .map((value) => `${month}-${value}`)
          .map((value) => new Date(value).getTime());
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  static async saveKeys(keys: Set<string>) {
    const value = JSON.stringify(Array.from(keys));
    await SecureStore.setItemAsync(`${this.PREFIX}-keys`, value).catch(
      console.warn
    );
  }

  static async saveMonth(key: string, dates: Set<number>) {
    const value = JSON.stringify(
      Array.from(dates).map((value) => new Date(value).getDate())
    );

    await SecureStore.setItemAsync(`${this.PREFIX}-${key}`, value).catch(
      console.warn
    );
  }
}

export default SelectedDateStorage;
