// Global types for Cribl platform variables injected into window.
// These are set by the Cribl platform at runtime — do NOT assign or polyfill them.

interface Window {
  /** The base path your app is mounted at (e.g. "/app-ui/my-app"). Read-only. */
  CRIBL_BASE_PATH?: string;
  /** Returns the currently signed-in Cribl user. Memoized. Read-only. */
  getCriblUser?: () => Promise<{
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    initials?: string;
  }>;
}