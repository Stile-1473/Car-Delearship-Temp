/**
 * CarModel
 * Shows a car's real 3D model when it has one (`car.model3d`), otherwise the
 * procedural car. The procedural car also stands in while the model loads and
 * if the file is missing or broken, so a bad upload never blanks the page.
 */

import React, { Component, Suspense } from 'react';
import ProceduralCar from './ProceduralCar';
import GLBCar from './GLBCar';

const GROUP_PROPS = new Set(['position', 'rotation', 'scale', 'visible']);

class ModelBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn(`3D model failed to load (${this.props.url}); using the built-in car instead.`, error);
  }

  componentDidUpdate(prev) {
    if (prev.url !== this.props.url && this.state.failed) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function CarModel({ car, onInfo, ...props }) {
  const procedural = <ProceduralCar bodyType={car.bodyType} {...props} />;
  if (!car.model3d) return procedural;

  // only these props apply to a loaded model; the rest (doors, rims, trim…) are procedural-only
  const { paint, finish, lightsOn } = props;
  const groupProps = Object.fromEntries(Object.entries(props).filter(([k]) => GROUP_PROPS.has(k)));
  return (
    <ModelBoundary url={car.model3d} fallback={procedural}>
      <Suspense fallback={procedural}>
        <GLBCar
          url={car.model3d}
          bodyType={car.bodyType}
          length={car.modelLength}
          yawDeg={car.modelRotation}
          paintMaterials={car.paintMaterials}
          paint={paint}
          finish={finish}
          lightsOn={lightsOn}
          onInfo={onInfo}
          {...groupProps}
        />
      </Suspense>
    </ModelBoundary>
  );
}
