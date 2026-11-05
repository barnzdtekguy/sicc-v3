export async function apiRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }

  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload.data;
}

export async function mutationResult(path, options = {}) {
  try {
    return { data: await apiRequest(path, options), error: null };
  } catch (error) {
    return { data: null, error };
  }
}
