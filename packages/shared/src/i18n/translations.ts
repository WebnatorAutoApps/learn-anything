import type { Locale, Translations } from "./types";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enCourse from "./locales/en/course.json";
import enLearn from "./locales/en/learn.json";
import enSettings from "./locales/en/settings.json";
import enLanding from "./locales/en/landing.json";

import esCommon from "./locales/es/common.json";
import esAuth from "./locales/es/auth.json";
import esDashboard from "./locales/es/dashboard.json";
import esCourse from "./locales/es/course.json";
import esLearn from "./locales/es/learn.json";
import esSettings from "./locales/es/settings.json";
import esLanding from "./locales/es/landing.json";

import frCommon from "./locales/fr/common.json";
import frAuth from "./locales/fr/auth.json";
import frDashboard from "./locales/fr/dashboard.json";
import frCourse from "./locales/fr/course.json";
import frLearn from "./locales/fr/learn.json";
import frSettings from "./locales/fr/settings.json";
import frLanding from "./locales/fr/landing.json";

import deCommon from "./locales/de/common.json";
import deAuth from "./locales/de/auth.json";
import deDashboard from "./locales/de/dashboard.json";
import deCourse from "./locales/de/course.json";
import deLearn from "./locales/de/learn.json";
import deSettings from "./locales/de/settings.json";
import deLanding from "./locales/de/landing.json";

import itCommon from "./locales/it/common.json";
import itAuth from "./locales/it/auth.json";
import itDashboard from "./locales/it/dashboard.json";
import itCourse from "./locales/it/course.json";
import itLearn from "./locales/it/learn.json";
import itSettings from "./locales/it/settings.json";
import itLanding from "./locales/it/landing.json";

import zhCommon from "./locales/zh/common.json";
import zhAuth from "./locales/zh/auth.json";
import zhDashboard from "./locales/zh/dashboard.json";
import zhCourse from "./locales/zh/course.json";
import zhLearn from "./locales/zh/learn.json";
import zhSettings from "./locales/zh/settings.json";
import zhLanding from "./locales/zh/landing.json";

import jaCommon from "./locales/ja/common.json";
import jaAuth from "./locales/ja/auth.json";
import jaDashboard from "./locales/ja/dashboard.json";
import jaCourse from "./locales/ja/course.json";
import jaLearn from "./locales/ja/learn.json";
import jaSettings from "./locales/ja/settings.json";
import jaLanding from "./locales/ja/landing.json";

function merge(...parts: Record<string, unknown>[]): Translations {
  return Object.assign({}, ...parts) as Translations;
}

export const translationMap: Record<Locale, Translations> = {
  en: merge(enCommon, enAuth, enDashboard, enCourse, enLearn, enSettings, enLanding),
  es: merge(esCommon, esAuth, esDashboard, esCourse, esLearn, esSettings, esLanding),
  fr: merge(frCommon, frAuth, frDashboard, frCourse, frLearn, frSettings, frLanding),
  de: merge(deCommon, deAuth, deDashboard, deCourse, deLearn, deSettings, deLanding),
  it: merge(itCommon, itAuth, itDashboard, itCourse, itLearn, itSettings, itLanding),
  zh: merge(zhCommon, zhAuth, zhDashboard, zhCourse, zhLearn, zhSettings, zhLanding),
  ja: merge(jaCommon, jaAuth, jaDashboard, jaCourse, jaLearn, jaSettings, jaLanding),
};
