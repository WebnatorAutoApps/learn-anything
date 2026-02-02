export async function fetchJSON<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
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
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Upload failed (${res.status})`);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
  return res.json();
}
