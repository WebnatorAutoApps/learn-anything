import { apiUrl } from "../config";
import { getAuthToken } from "../auth";

export async function fetchJSON<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(url), { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (${res.status})`);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchFormData<T>(
  url: string,
  formData: FormData
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(url), {
    method: "POST",
    body: formData,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Upload failed (${res.status})`);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
  return res.json();
}
