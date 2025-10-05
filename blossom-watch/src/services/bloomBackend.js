const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function fetchBloomMap(lat, lon, year) {
  const url = `${API_BASE}/bloom-map?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&year=${encodeURIComponent(year)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return await res.json();
}

export async function fetchBloomForecast(months = 6) {
  const url = `${API_BASE}/bloom-forecast?months=${encodeURIComponent(months)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return await res.json();
}

export async function sendChat(message) {
  const url = `${API_BASE}/ask`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message })
    });
    if (!res.ok) {
      // Try to parse JSON error for better feedback
      let detail = '';
      try {
        const j = await res.json();
        detail = JSON.stringify(j);
      } catch (_) {
        detail = await res.text();
      }
      throw new Error(`Chat error ${res.status}: ${detail.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.answer || '';
  } catch (err) {
    console.error('sendChat failed', err);
    throw err;
  }
}


