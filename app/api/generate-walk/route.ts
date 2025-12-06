import { NextResponse } from "next/server";

type GenerateWalkRequest = {
  distance?: number; // miles
};

const EARTH_RADIUS_KM = 6371;
const MILES_TO_KM = 1.60934;

// Fixed starting point: 236 Westminster St, Providence, RI 02903 (approx)
const START_LAT = 41.82306;
const START_LON = -71.41298;

export async function POST(req: Request) {
  try {
    let body: GenerateWalkRequest = {};

    try {
      body = (await req.json()) as GenerateWalkRequest;
    } catch {
      // If no/invalid body, just use defaults
    }

    // Clamp / default distance between 0.5 and 1 mile
    let distanceMiles =
      typeof body.distance === "number" ? body.distance : 0.75;
    if (distanceMiles < 0.5) distanceMiles = 0.5;
    if (distanceMiles > 1) distanceMiles = 1;

    // ---- Core random point algorithm (on a sphere) ----

    const theta = Math.random() * 2 * Math.PI; // random angle

    const distanceKm = distanceMiles * MILES_TO_KM;
    const delta = distanceKm / EARTH_RADIUS_KM;

    const lat0Rad = (START_LAT * Math.PI) / 180;
    const lon0Rad = (START_LON * Math.PI) / 180;

    const sinLat0 = Math.sin(lat0Rad);
    const cosLat0 = Math.cos(lat0Rad);
    const sinDelta = Math.sin(delta);
    const cosDelta = Math.cos(delta);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const sinLat1 = sinLat0 * cosDelta + cosLat0 * sinDelta * cosTheta;
    const lat1Rad = Math.asin(sinLat1);

    const y = sinTheta * sinDelta * cosLat0;
    const x = cosDelta - sinLat0 * sinLat1;
    const lon1Rad = lon0Rad + Math.atan2(y, x);

    const destLat = (lat1Rad * 180) / Math.PI;
    const destLon = (lon1Rad * 180) / Math.PI;

    // Google Maps link
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`;

    const responseData = {
      start: {
        lat: START_LAT,
        lon: START_LON,
      },
      destination: {
        lat: destLat,
        lon: destLon,
      },
      distanceMiles,
      googleMapsUrl,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error("Error in /api/generate-walk:", err);
    return NextResponse.json(
      { error: "Failed to generate walk." },
      { status: 500 }
    );
  }
}
