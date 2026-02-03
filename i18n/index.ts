import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import storage from "@/lib/storage";
import enUS from "@/i18n/locales/en-US";
import zhCN from "@/i18n/locales/zh-CN";

const resources = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

const initI18n = async () => {
  const savedLang = (await storage.getItem("language")) || "en-US";

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
