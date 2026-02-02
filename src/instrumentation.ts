export async function register() {
  // Only run encryption health-check on the server (not edge middleware)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEncryptionConfig } = await import("@/lib/crypto");
    const errors = validateEncryptionConfig();

    if (errors.length > 0) {
      console.error(
        "\n[STARTUP] Encryption configuration health-check FAILED:\n" +
          errors.map((e) => `  - ${e}`).join("\n") +
          "\n"
      );

      // Log a warning but allow the server to start. Endpoints that don't
      // require encryption (e.g. /api/user, /api/courses GET, /api/logout)
      // will continue to work. Endpoints that call encrypt()/decrypt() will
      // return proper error responses when invoked — the crypto module
      // already validates the config on each call.
      console.warn(
        "[STARTUP] Server starting despite encryption misconfiguration.\n" +
          "  API key encryption/decryption will fail until this is resolved.\n"
      );
    } else {
      console.info("[STARTUP] Encryption configuration health-check passed.");
    }
  }
}
