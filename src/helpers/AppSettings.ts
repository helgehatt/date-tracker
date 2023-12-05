import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "app.v1.0.2-beta.settings.";
type Setting = "hasInitialized" | "selectedCategory";

async function getItem(key: Setting) {
  return AsyncStorage.getItem(PREFIX + key).catch(console.warn);
}

async function setItem(key: Setting, value: string) {
  return AsyncStorage.setItem(PREFIX + key, value).catch(console.warn);
}

class AppSettings {
  static async getHasInitialized() {
    return getItem("hasInitialized").then((value) => value === "true");
  }
  static async setHasInitialized(hasInitialized: boolean) {
    return setItem("hasInitialized", String(hasInitialized));
  }
  static async getSelectedCategory() {
    return getItem("selectedCategory").then((value) =>
      value ? Number(value) : undefined
    );
  }
  static async setSelectedCategory(category_id: number) {
    return setItem("selectedCategory", String(category_id));
  }
}

export default AppSettings;
