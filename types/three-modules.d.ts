// Declarações de tipos para Three.js e seus módulos
declare module 'three' {
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    divideScalar(s: number): this;
    length(): number;
    normalize(): this;
    clone(): Vector3;
  }

  export class Color {
    constructor(r?: number | string, g?: number, b?: number);
    r: number;
    g: number;
    b: number;
    set(color: number | string): this;
    copy(color: Color): this;
  }

  export class Scene {
    constructor();
    background: Color | null;
    add(object: Object3D): this;
    remove(object: Object3D): this;
    children: Object3D[];
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: Vector3;
    lookAt(target: Vector3 | number, y?: number, z?: number): this;
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    constructor(parameters?: { antialias?: boolean, alpha?: boolean, preserveDrawingBuffer?: boolean });
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number): void;
    setPixelRatio(value: number): void;
    setClearColor(color: number | string | Color, alpha?: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export class Camera extends Object3D {
    matrixWorldInverse: Matrix4;
    projectionMatrix: Matrix4;
    projectionMatrixInverse: Matrix4;
  }

  export class Object3D {
    constructor();
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    parent: Object3D | null;
    children: Object3D[];
    visible: boolean;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    userData: { [key: string]: any };
  }

  export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number;
    y: number;
    z: number;
    order: string;
    set(x: number, y: number, z: number, order?: string): this;
  }

  export class Matrix4 {
    constructor();
    elements: number[];
    set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): this;
    identity(): this;
    copy(m: Matrix4): this;
    makeRotationFromEuler(euler: Euler): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
  }

  export class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    set(x: number, y: number, z: number, w: number): this;
    copy(q: Quaternion): this;
  }

  export class EventDispatcher {
    addEventListener(type: string, listener: (event: any) => void): void;
    removeEventListener(type: string, listener: (event: any) => void): void;
    dispatchEvent(event: { type: string, [attachment: string]: any }): void;
  }

  export class BufferGeometry {
    constructor();
    attributes: { [name: string]: any };
    setFromPoints(points: Vector3[]): this;
    dispose(): void;
  }

  export class LineBasicMaterial {
    constructor(parameters?: { color?: number | string | Color, linewidth?: number });
    color: Color;
    linewidth: number;
    dispose(): void;
  }

  export class Line extends Object3D {
    constructor(geometry?: BufferGeometry, material?: LineBasicMaterial);
    geometry: BufferGeometry;
    material: LineBasicMaterial;
  }

  export class GridHelper extends Object3D {
    constructor(size?: number, divisions?: number, color1?: number, color2?: number);
  }

  export class AxesHelper extends Object3D {
    constructor(size?: number);
  }

  export class AmbientLight extends Light {
    constructor(color?: number | string | Color, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: number | string | Color, intensity?: number);
    position: Vector3;
    target: Object3D;
  }

  export class Light extends Object3D {
    constructor(color?: number | string | Color, intensity?: number);
    color: Color;
    intensity: number;
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
    geometry: BufferGeometry;
    material: Material;
    userData: { [key: string]: any };
  }

  export class BoxGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, depth?: number);
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: { color?: number | string | Color });
    color: Color;
    dispose(): void;
  }

  export class MeshPhongMaterial extends Material {
    constructor(parameters?: { 
      color?: number | string | Color,
      specular?: number | string | Color,
      shininess?: number
    });
    color: Color;
    specular: Color;
    shininess: number;
    dispose(): void;
  }

  export class Group extends Object3D {
    constructor();
    type: string;
  }

  export class CylinderGeometry extends BufferGeometry {
    constructor(
      radiusTop?: number,
      radiusBottom?: number,
      height?: number,
      radialSegments?: number
    );
  }

  export interface Material {
    dispose(): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): boolean;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export * from 'three/examples/jsm/controls/OrbitControls';
}
