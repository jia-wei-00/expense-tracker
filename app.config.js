// Extends app.json (Expo loads it and passes it in as `config`).
// We only inject the Android googleServicesFile here so the gitignored
// google-services.json can be supplied by an EAS "file" env var
// (GOOGLE_SERVICES_JSON) in CI/EAS builds, with a local fallback for
// `expo run:android`. Everything else stays in app.json.
export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
  },
});
