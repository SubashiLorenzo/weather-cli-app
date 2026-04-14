// weather.js
// Uso: node weather.js "Roma"

// --- CONFIG ---
const GEOCODING_API_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const WEATHER_API_BASE_URL = "https://api.open-meteo.com/v1";

// --- FETCH ---
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Errore API: " + response.status);
    }
    return await response.json();
  } catch (err) {
    throw new Error("Errore rete: " + err.message);
  }
}

// --- FUNZIONE PRINCIPALE ---
async function getWeather(cityName) {
  if (!cityName || cityName.trim() === "") {
    throw new Error("Inserisci una città");
  }

  // 1. Geocoding
  const geoURL =
    GEOCODING_API_BASE_URL +
    "/search?name=" +
    encodeURIComponent(cityName) +
    "&count=1&language=it";

  const geoData = await fetchData(geoURL);

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("Città non trovata");
  }

  const city = geoData.results[0];

  // 2. Meteo
  const weatherURL =
    WEATHER_API_BASE_URL +
    "/forecast?latitude=" +
    city.latitude +
    "&longitude=" +
    city.longitude +
    "&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation" +
    "&daily=temperature_2m_max,temperature_2m_min&timezone=auto";

  const weatherData = await fetchData(weatherURL);

  const current = weatherData.current;
  const daily = weatherData.daily;

  return {
    name: city.name,
    country: city.country,
    temperature: current.temperature_2m,
    perceived: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    rain: current.precipitation,
    max: daily.temperature_2m_max[0],
    min: daily.temperature_2m_min[0],
  };
}

// --- MAIN ---
(async () => {
  const city = process.argv[2];

  if (!city || city.trim() === "") {
    console.log('❌ Usa: node weather.js "Roma"');
    return;
  }

  try {
    const data = await getWeather(city);

    console.log(`\n📍 ${data.name}, ${data.country}`);
    console.log(`🌡️ Temperatura: ${data.temperature}°C`);
    console.log(`🤔 Percepita: ${data.perceived}°C`);
    console.log(`☀️ Max: ${data.max}°C | Min: ${data.min}°C`);

    console.log("\n📊 Altri dati:");
    console.log(`💧 Umidità: ${data.humidity}%`);
    console.log(`💨 Vento: ${data.wind} km/h`);
    console.log(`🌧️ Pioggia: ${data.rain} mm\n`);
  } catch (err) {
    console.log("❌ Errore:", err.message);
  }
})();
