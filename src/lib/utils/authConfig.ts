// src/lib/utils/auth.config.ts

export const AUTH_CONFIG = {
  COOKIE: {
    IS_LOGGED_IN: "isLoggedIn",
    LAST_ACTIVITY: "lastActivity",
    TOKEN: "authToken",
  },

  PUBLIC_PAGES: [
    "/administrative/login",
    "/administrative/registration",
    "/employee-portal/login",
    "/employee-portal/registration",
    "time-keeping/login",
    "time-keeping/registration",
    "hr-management/login",
    "hr-management/registration",
  ],

  INACTIVITY_LIMIT: 60, // seconds
};