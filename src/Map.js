import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import pakistanGeoJSON from "./pakjson.json"; // Replace with the path to your pakistan.geojson file

const defaultCenter = [30.3753, 69.3451]; // Center of Pakistan
const defaultZoom = 5;

const citiesData = [
  { position: [31.5497, 74.3436], name: "Lahore", province: "Punjab" },
  { position: [24.8607, 67.0011], name: "Karachi", province: "Sindh" },
  // Add more city data as needed
];

const provinceData = [
  { position: [30.3753, 69.3451], name: "Punjab" },
  { position: [30.1625, 66.9961], name: "Sindh" },
  // Add more province data as needed
];

// Function to calculate the bounds of the GeoJSON data
function calculateGeoJSONBounds(geojsonData) {
  const coordinates = geojsonData.features.flatMap((feature) => feature.geometry.coordinates.flat());
  const bounds = coordinates.reduce(
    (acc, coord) => {
      return [
        [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
        [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])],
      ];
    },
    [
      [90, 180], // Southwest coordinates
      [-90, -180], // Northeast coordinates
    ]
  );
  return bounds;
}

export default function LeafletMap() {
  // Function to create a custom DivIcon for city names
  function createCityIcon(cityName) {
    return new DivIcon({
      className: "city-icon",
      html: `<div>${cityName}</div>`,
    });
  }

  // Function to create a custom DivIcon for province names
  function createProvinceIcon(provinceName) {
    return new DivIcon({
      className: "province-icon",
      html: `<div>${provinceName}</div>`,
    });
  }

  const mapRef = useRef(null);

  // Function to create the custom SVG overlay to hide non-Pakistan areas
  function createSVGOverlay(bounds) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svgElement = document.createElementNS(svgNS, "svg");
    const pathElement = document.createElementNS(svgNS, "path");

    // Define the path of the SVG overlay
    const pathCoordinates = [
      mapRef.current.leafletElement.latLngToLayerPoint([bounds[0][1], bounds[0][0]]),
      mapRef.current.leafletElement.latLngToLayerPoint([bounds[1][1], bounds[0][0]]),
      mapRef.current.leafletElement.latLngToLayerPoint([bounds[1][1], bounds[1][0]]),
      mapRef.current.leafletElement.latLngToLayerPoint([bounds[0][1], bounds[1][0]]),
    ];
    const pathString = pathCoordinates
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    // Set attributes for the path element
    pathElement.setAttributeNS(null, "d", `M ${pathString} Z`);
    pathElement.setAttributeNS(null, "fill", "white"); // Fill the non-Pakistan areas with white color
    pathElement.setAttributeNS(null, "stroke", "none");

    // Append the path element to the SVG overlay
    svgElement.appendChild(pathElement);

    // Set styles for the SVG overlay
    svgElement.setAttribute("style", "pointer-events: none; position: absolute; top: 0; left: 0;");

    return svgElement;
  }


  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "100vh", width: "100%" }} whenCreated={(map) => (mapRef.current = map)}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        onLoad={() => {
          // Create the custom SVG overlay to hide non-Pakistan areas when the map is fully loaded
          if (mapRef.current && pakistanGeoJSON) {
            const bounds = calculateGeoJSONBounds(pakistanGeoJSON);
            const svgOverlay = createSVGOverlay(bounds);
            mapRef.current.leafletElement.getPanes().overlayPane.appendChild(svgOverlay);
          }
        }}
      />

      {/* Add city markers with popups */}
      {citiesData.map((city, index) => (
        <Marker key={index} position={city.position} icon={createCityIcon(city.name)}>
          <Popup>{city.name}, {city.province}</Popup>
        </Marker>
      ))}

      {/* Add province markers with popups */}
      {provinceData.map((province, index) => (
        <Marker key={index} position={province.position} icon={createProvinceIcon(province.name)}>
          <Popup>{province.name}</Popup>
        </Marker>
      ))}

      {/* Add the GeoJSON layer for Pakistan */}
      <GeoJSON data={pakistanGeoJSON} style={{ fill: "none", color: "red", weight: 2 }} />
    </MapContainer>
  );
}
