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


