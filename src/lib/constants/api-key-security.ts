export interface SecuritySection {
  title: string;
  body: string;
}

export const API_KEY_SECURITY_SECTIONS: SecuritySection[] = [
  {
    title: "How we store your key",
    body: "Your API key is encrypted at rest using AES-256-GCM before it is saved to our database. It is never logged or stored in plaintext. Only the last four characters are retained unencrypted so you can identify which key is on file.",
  },
  {
    title: "No system is invulnerable",
    body: "We take security seriously, but no online service can guarantee it will never be breached — even large companies like Sony PlayStation and many others have experienced data leaks. We believe in being transparent about this reality rather than making promises we cannot keep.",
  },
  {
    title: "Create a dedicated key",
    body: "We strongly recommend generating a separate API key specifically for this application. That way, if you ever need to revoke it, you can do so without affecting your other projects or services.",
  },
  {
    title: "Use the free-tier plan only",
    body: "Link your API key to Google's free-tier plan so that even in a worst-case breach scenario there is zero financial exposure. The free tier is sufficient for using this application.",
  },
  {
    title: "Revoke when no longer needed",
    body: "If you stop using this application, head over to Google AI Studio and delete the key you created for it. Keeping unused credentials active is an unnecessary risk.",
  },
];
