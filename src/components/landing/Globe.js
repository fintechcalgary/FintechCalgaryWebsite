"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import GlobeGL from "react-globe.gl";
import { feature } from "topojson-client";
import { MeshLambertMaterial } from "three";

// Move static configurations outside component
const GLOBE_MATERIAL = new MeshLambertMaterial({
  color: "#1e1b4b",
  opacity: 0.1,
  transparent: true,
});

const POLYGON_CAP_COLOR = "#1e1b4b";
const POLYGON_SIDE_COLOR = "#1e1b4b";
const POLYGON_STROKE_COLOR = "#6d28d9";

export default function Globe() {
  const globeRef = useRef();
  const [polygons, setPolygons] = useState([]);

  // Use useCallback for simple function returns
  const polygonCapColor = useCallback(() => POLYGON_CAP_COLOR, []);
  const polygonSideColor = useCallback(() => POLYGON_SIDE_COLOR, []);
  const polygonStrokeColor = useCallback(() => POLYGON_STROKE_COLOR, []);

  useEffect(() => {
    let mounted = true;
    let controls;

    fetch("//unpkg.com/world-atlas/land-110m.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch globe data");
        return res.json();
      })
      .then((landTopo) => {
        if (!mounted || !globeRef.current) return;

        const landFeatures = feature(landTopo, landTopo.objects.land).features;
        setPolygons(landFeatures);

        controls = globeRef.current.controls();
        controls.enableZoom = false;
        controls.mouseButtons = {};
        controls.enablePan = false;
        controls.enableRotate = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;

        controls.minDistance = 200;
        controls.maxDistance = 400;
        controls.minPolarAngle = Math.PI / 3;
        controls.maxPolarAngle = Math.PI - Math.PI / 3;
      })
      .catch(console.error);

    return () => {
      mounted = false;
      if (controls) {
        controls.dispose();
      }
    };
  }, []);

  return (
    <GlobeGL
      ref={globeRef}
      backgroundColor="rgba(0,0,0,0)"
      showGlobe={false}
      showAtmosphere={true}
      atmosphereColor="#8b5cf6"
      atmosphereAltitude={0.15}
      polygonsData={polygons}
      polygonCapColor={polygonCapColor}
      polygonSideColor={polygonSideColor}
      polygonStrokeColor={polygonStrokeColor}
      polygonAltitude={0.01}
      globeMaterial={GLOBE_MATERIAL}
      width={1800}
      height={1800}
    />
  );
}
