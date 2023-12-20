import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "app.settings.";
type Setting = "selectedCategory";

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
  static async getSelectedCategory() {
    return getItem("selectedCategory").then((value) =>
      value ? Number(value) : undefined
    );
  }
  static async setSelectedCategory(categoryId: number) {
    return setItem("selectedCategory", String(categoryId));
  }
  static async removeSelectedCategory() {
    return removeItem("selectedCategory");
  }
}

export default AppSettings;
