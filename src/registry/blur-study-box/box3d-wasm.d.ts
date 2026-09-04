declare module "box3d-wasm/standard" {
  export interface Box3DVector3 {
    x: number;
    y: number;
    z: number;
  }

  export interface Box3DQuaternion extends Box3DVector3 {
    w: number;
  }

  export interface Box3DShape {
    delete(): void;
  }

  export interface Box3DRayHit {
    hit: boolean;
    bodyUserData: number;
    point: Box3DVector3;
    shape?: Box3DShape;
  }

  export interface Box3DBody {
    createBox(options: {
      halfExtents: Box3DVector3;
      friction: number;
      restitution: number;
    }): Box3DShape;
    createCapsule(options: {
      height: number;
      radius: number;
      density: number;
      friction: number;
      restitution: number;
    }): Box3DShape;
    getPosition(): Box3DVector3;
    getRotation(): Box3DQuaternion;
    getMass(): number;
    getLocalPoint(point: Box3DVector3): Box3DVector3;
    getWorldPoint(point: Box3DVector3): Box3DVector3;
    getWorldCenterOfMass(): Box3DVector3;
    getLinearVelocity(): Box3DVector3;
    getAngularVelocity(): Box3DVector3;
    applyLinearImpulseToCenter(impulse: Box3DVector3, wake: boolean): void;
    applyAngularImpulse(impulse: Box3DVector3, wake: boolean): void;
    applyForce(force: Box3DVector3, point: Box3DVector3, wake: boolean): void;
    setAwake(awake: boolean): void;
    delete(): void;
  }

  export interface Box3DWorld {
    createBody(options: {
      type: "static" | "dynamic";
      userData?: number;
      position: Box3DVector3;
      rotation?: Box3DQuaternion;
      linearVelocity?: Box3DVector3;
      angularVelocity?: Box3DVector3;
      linearDamping?: number;
      angularDamping?: number;
      sleepThreshold?: number;
      enableSleep?: boolean;
      isAwake?: boolean;
      isBullet?: boolean;
    }): Box3DBody;
    castRayClosest(
      origin: Box3DVector3,
      translation: Box3DVector3,
    ): Box3DRayHit;
    step(seconds: number, substeps: number): void;
    getAwakeBodyCount(): number;
    destroy(): void;
    delete(): void;
  }

  export interface Box3DModule {
    World: new (options: {
      gravity: Box3DVector3;
      enableSleep: boolean;
      enableContinuous: boolean;
    }) => Box3DWorld;
  }

  export default function createBox3D(): Promise<Box3DModule>;
}
