import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "app.settings.";
type Setting = "activeCategory";

async function getItem(key: Setting) {
  return AsyncStorage.getItem(PREFIX + key).catch(console.warn);
}

async function setItem(key: Setting, value: string) {
  return AsyncStorage.setItem(PREFIX + key, value).catch(console.warn);
}

async function removeItem(key: Setting) {
  return AsyncStorage.removeItem(PREFIX + key).catch(console.warn);
}

class AppSettings {
  static async getActiveCategory() {
    return getItem("activeCategory").then((value) =>
      value ? Number(value) : null
    );
  }
  static async setActiveCategory(categoryId: number) {
    return setItem("activeCategory", String(categoryId));
  }
  static async removeActiveCategory() {
    return removeItem("activeCategory");
  }
}

export default AppSettings;
