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

      // In production, refuse to start with broken encryption
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Encryption misconfigured — server cannot start. See errors above."
        );
      }

      // In development, warn but allow startup so devs can work on non-encryption features
      console.warn(
        "[STARTUP] Continuing in development mode despite encryption misconfiguration.\n" +
          "  API key encryption/decryption will fail until this is resolved.\n"
      );
    } else {
      console.log("[STARTUP] Encryption configuration health-check passed.");
    }
  }
}
