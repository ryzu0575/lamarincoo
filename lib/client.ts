/** POST ke API internal dengan penanganan error ramah. */
export async function apiPost<T>(url: string, body: FormData | object, signal?: AbortSignal): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      body: isForm ? body : JSON.stringify(body),
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }
  let data: { error?: string } & Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan. Silakan coba lagi.");
  return data as T;
}
