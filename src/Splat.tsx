import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { fragmentShaderSource, vertexShaderSource } from './splat-shaders';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useControls, button, folder } from 'leva';
// import { ASSET_BASE_URL } from './utils/constants';

// console.log('🚀 ~ file: Splat.tsx:11 ~ host:', host);
// const splatSortWorker = new URL('../splat-sort-worker.js', host);

const workerBlob = new Blob(
  [
    `
    (function(){"use strict";let A=1/0,c,d=0,x,o=new BigInt64Array,b=[];const g=r=>{if(!c)return;const n=Math.min(d,A),a=new Float32Array(c),f=new Uint8Array(c),s=new Float32Array(4*n),i=new Float32Array(3*n),u=new Float32Array(3*n),l=new Float32Array(4*n);if(o.length!==n){o=new BigInt64Array(n);const t=new Uint32Array(o.buffer);for(let e=0;e<n;e++)t[2*e]=e}else{let t=b[2]*r[2]+b[6]*r[6]+b[10]*r[10];if(Math.abs(t-1)<.01)return}const F=new Float32Array(o.buffer),M=new Uint32Array(o.buffer);for(let t=0;t<n;t++){let e=M[2*t];F[2*t+1]=1e4-(r[2]*a[8*e+0]+r[6]*a[8*e+1]+r[10]*a[8*e+2])}b=r,o.sort();for(let t=0;t<n;t++){const e=M[2*t];s[4*t+0]=(f[32*e+28+0]-128)/128,s[4*t+1]=(f[32*e+28+1]-128)/128,s[4*t+2]=(f[32*e+28+2]-128)/128,s[4*t+3]=(f[32*e+28+3]-128)/128,u[3*t+0]=a[8*e+0],u[3*t+1]=a[8*e+1],u[3*t+2]=a[8*e+2],l[4*t+0]=f[32*e+24+0]/255,l[4*t+1]=f[32*e+24+1]/255,l[4*t+2]=f[32*e+24+2]/255,l[4*t+3]=f[32*e+24+3]/255,i[3*t+0]=a[8*e+3+0],i[3*t+1]=a[8*e+3+1],i[3*t+2]=a[8*e+3+2]}self.postMessage({quat:s,center:u,color:l,scale:i,viewProj:r},[s.buffer,u.buffer,l.buffer,i.buffer])},w=()=>{if(!y){y=!0;let r=x;g(r),setTimeout(()=>{y=!1,r!==x&&w()},0)}};let y;self.onmessage=r=>{r.data.buffer?(c=r.data.buffer,d=r.data.vertexCount):r.data.vertexCount?d=r.data.vertexCount:r.data.view&&(x=r.data.view,A=r.data.maxSplats,w())}})();
`,
  ],
  { type: 'application/javascript' }
);

const workerBlobURL = URL.createObjectURL(workerBlob);

const computeFocalLengths = (
  width: number,
  height: number,
  fov: number,
  aspect: number,
  dpr: number
) => {
  const fovRad = THREE.MathUtils.degToRad(fov);
  const fovXRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const fy = (dpr * height) / (2 * Math.tan(fovRad / 2));
  const fx = (dpr * width) / (2 * Math.tan(fovXRad / 2));
  return new THREE.Vector2(fx, fy);
};

const Splat = ({ file }: { file?: Uint8Array }) => {
  const [
    {
      // resetPosition,
      maxSplats,
      rotationAxis,
      flipScene,
      xPos,
      yPos,
      zPos,
      // xRot,
      // yRot,
      // zRot,
    },
    set,
  ] = useControls(() => ({
    quality: folder({
      maxSplats: { value: 1000000, min: 10000, max: 1000000000, step: 100000 },
    }),
    position: folder({
      xPos: { value: 0, step: 1 },
      yPos: { value: 0, step: 1 },
      zPos: { value: 0, step: 1 },
    }),
    rotation: folder({
      xRot: { value: 0, min: -180, step: 0.1 },
      yRot: { value: 0, min: -180, step: 0.1 },
      zRot: { value: 0, min: -180, step: 0.1 },
    }),
    scene: folder({
      rotationAxis: { value: 'Z', options: ['X', 'Y', 'Z'] },
      flipScene: false,
    }),
    // scene: folder({
    //   // ' ': {value: 'Choose vertical axis', editable: false},
    //   // vertical: 'x',

    // ' ': buttonGroup({
    //     '0.25x': () => set({ vertical: 0.25 }),
    //     '0.5x': () => set({ vertical: 0.5 }),
    //     '1x': () => set({ vertical: 1 }),
    //     '2x': () => set({ vertical: 2 }),
    //     '3x': () => set({ vertical: 3 }),
    //   }),

    //   // 'X axis': button(() => set({vertical: 'x'}), {disabled: vertical === 'x'}),
    //   // 'Y axis': button(() => set({vertical: 'y'}), {disabled: vertical === 'y'}),
    //   // 'Z axis': button(() => set({vertical: 'z'}), {disabled: vertical === 'z'}),
    // }),
    'Reset position': button(() => {
      camera.position.set(0, 0, 100);
      camera.rotation.set(0, 0, 1);
      camera.lookAt(0, 0, 0); // Optionally reset orientation so camera looks along positive Z axis
    }),
  }));

  // Allow direct access to the mesh
  const ref = useRef<THREE.Mesh>(null);

  // Web worker doing the splat sorting
  const [worker] = useState(() => new Worker(workerBlobURL));
  // const [mouseMoved, setMouseMoved] = useState(false);

  // const handleMouseMove = () => {
  //   setMouseMoved(true);
  // };

  // Listen to screen and viewport
  const {
    size: { width, height },
    camera,
    viewport: { dpr },
    // raycaster,
    // mouse,
  } = useThree();

  // // TODO make this unset the orbitcontrols position instead of forcing the 0,0,0
  // const orbitControlsRef = useRef();

  // const handleClick = (event) => {
  //   // TODO temporarily using this to disable click controls. Not nice
  //   // orbitControlsRef.current.enabled = false
  //   if (!mouseMoved) return;
  //   event.stopPropagation();

  //   const mesh = ref.current;

  //   raycaster.setFromCamera(mouse, camera);

  //   const intersects = raycaster.intersectObject(mesh, true);

  //   if (intersects.length) {
  //     // console.log("🚀 ~ file: splat-object.tsx:108 ~ handleClick ~ intersects.length:", intersects.length)
  //     const point = intersects[0].point;

  //     const savedRotation = camera.rotation.clone();
  //     // console.log("🚀 ~ file: splat-object.tsx:124 ~ handleClick ~ savedRotation:", savedRotation)
  //     const savedPosition = camera.position.clone();
  //     // console.log("🚀 ~ file: splat-object.tsx:125 ~ handleClick ~ savedPosition:", savedPosition)

  //     orbitControlsRef.current?.target.copy(point);
  //     // orbitControlsRef.current?.update()

  //     camera.rotation.copy(savedRotation);
  //     camera.position.copy(savedPosition);
  //     // orbitControlsRef.current.enabled = true
  //     // camera.position.set(savedPosition.x, savedPosition.y, savedPosition.z);

  //     // Set camera lookAt point to original lookAt point
  //   }
  // };

  // Expose camera object to window for better debugging
  // window.camera = camera;

  // Initialize uniforms
  const [uniforms] = useState({
    viewport: {
      value: new THREE.Vector2(width * dpr, height * dpr),
    },
    focal: {
      // @ts-expect-error properties do exist
      value: computeFocalLengths(width, height, camera.fov, camera.aspect, dpr),
    },
  });

  // Update uniforms when window changes
  useEffect(() => {
    uniforms.focal.value = computeFocalLengths(
      width,
      height,
      // @ts-expect-error properties do exist
      camera.fov,
      // @ts-expect-error properties do exist
      camera.aspect,
      dpr
    );
    uniforms.viewport.value = new THREE.Vector2(width * dpr, height * dpr);
    // @ts-expect-error properties do exist
  }, [width, height, camera.fov, camera.aspect, dpr]);

  // Initialize attribute buffers
  const [buffers, setBuffers] = useState({
    index: new Uint16Array([0, 1, 2, 2, 3, 0]),
    position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
    color: new Float32Array([1, 0, 1, 1, 1, 1, 0, 1]),
    quat: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]),
    scale: new Float32Array([1, 1, 1, 2, 0.5, 0.5]),
    center: new Float32Array([0, 0, 0, 2, 0, 0]),
  });

  // Send current camera pose to splat sorting worker
  useFrame(
    (
      state
      // _delta, _xrFrame
    ) => {
      const mesh = ref.current;
      if (mesh == null) {
        return;
      }
      const camera = state.camera;
      // Set coordinates derived from useControls
      const { x: xPos, y: yPos, z: zPos } = camera.position;
      const { x: xRot, y: yRot, z: zRot } = camera.rotation;
      set({ xPos });
      set({ yPos });
      set({ zPos });
      set({ xRot: (xRot * 180) / Math.PI });
      set({ yRot: (yRot * 180) / Math.PI });
      set({ zRot: (zRot * 180) / Math.PI });
      const viewProj = new THREE.Matrix4()
        .multiply(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(mesh.matrixWorld);
      worker.postMessage({ view: viewProj.elements, maxSplats });
    }
  );

  // Receive sorted buffers from sorting worker
  useEffect(() => {
    worker.onmessage = (e) => {
      const { quat, scale, center, color /*viewProj*/ } = e.data;
      // We could store viewProj here
      // lastProj = viewProj
      setBuffers((buffers) => ({ ...buffers, quat, scale, center, color }));
    };
    return () => {
      worker.onmessage = null;
    };
  });

  // If flipscene is checked, flip scene vertically
  // useEffect(() => {
  //   if (flipScene) {
  //     camera.up.set(0, 0, 1);
  //     set({flipScene: true})
  //   } else {
  //     camera.up.set(0, 0, 0);
  //     set({flipScene: false})

  //   }
  // },[flipScene, camera, set])

  // Load splat file from url
  useEffect(() => {
    //   console.log("🚀 ~ file: splat-object.tsx:149 ~ file:", file)
    //   let stopLoading = false;
    //   const loadModel = () => {
    //     // const req = await fetch(url, {
    //     //   mode: 'cors',
    //     //   credentials: 'omit',
    //     // });
    //     // if (
    //     //   req.status != 200 ||
    //     //   req.body == null ||
    //     //   req.headers == null ||
    //     //   req.headers.get('content-length') == null
    //     // ) {
    //     //   throw new Error(req.status + ' Unable to load ' + req.url);
    //     // }
    //     // const reader = req.body.getReader();
    //     // console.log("🚀 ~ file: splat-object.tsx:114 ~ loadModel ~ reader:", reader)
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
    //     // let splatData = new Uint8Array(
    //     //   parseInt(req.headers.get('content-length')!)
    //     // );
    //     // console.log("🚀 ~ file: splat-object.tsx:119 ~ loadModel ~ splatData:", splatData)
    const vertexCount = 0;
    let lastVertexCount = -1;
    let bytesRead = 0;
    bytesRead += file?.length || 0;

    if (vertexCount > lastVertexCount) {
      worker.postMessage({
        buffer: file?.buffer,
        vertexCount: Math.floor(bytesRead / rowLength),
      });
      lastVertexCount = vertexCount;
    }
    //     while (true) {
    //       // const { done, value } = await reader.read();
    //       // if (done || stopLoading) break;
    //       // splatData.set(value, bytesRead);
    //       bytesRead += file?.length || 0;
    //       if (vertexCount > lastVertexCount) {
    //         worker.postMessage({
    //           buffer: file?.buffer,
    //           vertexCount: Math.floor(bytesRead / rowLength),
    //         });
    //         lastVertexCount = vertexCount;
    //       }
    //     }
    //     // if (!stopLoading) {
    //     //   worker.postMessage({
    //     //     buffer: file?.buffer,
    //     //     vertexCount: Math.floor(bytesRead / rowLength),
    //     //   });
    //     // }
    //   };
    //   loadModel();
    //   return () => {
    //     stopLoading = true;
    //   };
  }, [file, worker]);

  // Update camera position from control panel values
  useEffect(() => {
    camera.position.set(xPos, yPos, zPos);
  }, [xPos, yPos, zPos, camera]);

  // // // Update camera rotation from control panel values
  // useEffect(() => {
  //   camera.rotation.set(xRot*Math.PI/180, yRot*Math.PI/180, zRot*Math.PI/180);
  // }, [xRot, yRot, zRot, camera])

  // Signal to Three that attributes change when their buffer change
  const update = useCallback(
    (self: THREE.InstancedBufferAttribute | THREE.BufferAttribute) => {
      self.needsUpdate = true;
    },
    []
  );

  // Set axis of rotation
  useEffect(() => {
    camera.up.set(
      rotationAxis === 'X' ? 1 : 0,
      rotationAxis === 'Y' ? 1 : 0,
      rotationAxis === 'Z' ? 1 : 0
    );
    set({ flipScene: false });
  }, [rotationAxis]);

  // Set position on load
  useEffect(() => {
    camera.position.set(
      rotationAxis === 'X' ? 100 : 0,
      rotationAxis === 'Y' ? 100 : 0,
      rotationAxis === 'Z' ? 100 : 0
    );
    camera.lookAt(0, 0, 0); // Ensure camera is looking at the origin
  }, [file]);

  // If flipscene is checked, flip scene vertically
  useEffect(() => {
    if (flipScene) {
      camera.up.set(
        rotationAxis === 'X' ? -1 : 0,
        rotationAxis === 'Y' ? -1 : 0,
        rotationAxis === 'Z' ? -1 : 0
      );
      set({ flipScene: true });
    } else {
      camera.up.set(
        rotationAxis === 'X' ? 1 : 0,
        rotationAxis === 'Y' ? 1 : 0,
        rotationAxis === 'Z' ? 1 : 0
      );
      // scene.scale.y = 1;
      set({ flipScene: false });
    }
  }, [flipScene, camera, set]);

  // Count number of instances to feed where needed
  const instanceCount = Math.min(buffers.quat.length / 4, maxSplats);

  //   // delete when done
  //   const vertexShader = `
  //   varying vec3 vUv;
  //   void main() {
  //     vUv = position;
  //     vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  //     gl_Position = projectionMatrix * modelViewPosition;
  //   }
  // `;

  // // Fragment Shader
  // const fragmentShader = `
  //   varying vec3 vUv;
  //   void main() {
  //     gl_FragColor = vec4(vUv.z * vec3(1.0, 0.0, 0.0) + (1.0 - vUv.z) * vec3(0.0, 0.0, 1.0), 1.0);
  //   }
  // `;

  return (
    // <mesh position={[0, 0, 0]} onPointerDown={(e) => console.log('onClick mesh: ', e)}>
    //     <boxGeometry attach="geometry" args={[10, 10, 10]} />
    //     <meshStandardMaterial attach="material" color="hotpink" wireframe />
    //   </mesh>
    <mesh
      ref={ref}
      renderOrder={10}
      // onPointerDown={handleClick}
      // onPointerMove={handleMouseMove}
    >
      {/* <shaderMaterial
        attach="material"
        args={[{
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
        }]}
      />
<boxGeometry attach="geometry" args={[10, 10, 10]} /> */}
      <group>
        <axesHelper args={[5]} />
        <Text position={[2, 0, 0]} fontSize={0.4} color="red">
          X
        </Text>
        <Text position={[0, 2, 0]} fontSize={0.4} color="green">
          Y
        </Text>
        <Text position={[0, 0, 2]} fontSize={0.4} color="blue">
          Z
        </Text>
      </group>
      <instancedBufferGeometry
        key={instanceCount}
        instanceCount={instanceCount}
      >
        <bufferAttribute
          attach="index"
          onUpdate={update}
          array={buffers.index}
          itemSize={1}
          count={6}
        />
        <bufferAttribute
          attach="attributes-position"
          onUpdate={update}
          array={buffers.position}
          itemSize={3}
          count={4}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          onUpdate={update}
          array={buffers.color}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-quat"
          onUpdate={update}
          array={buffers.quat}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-scale"
          onUpdate={update}
          array={buffers.scale}
          itemSize={3}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-center"
          onUpdate={update}
          array={buffers.center}
          itemSize={3}
          count={instanceCount}
        />
      </instancedBufferGeometry>

      {/* <OrbitControls
        enableDamping={false}
        // ref={orbitControlsRef}
      /> */}
      {/* <TrackballControls ref={orbitControlsRef}/> */}
      <rawShaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShaderSource}
        vertexShader={vertexShaderSource}
        depthTest={true}
        depthWrite={false}
        transparent={true}
      />
    </mesh>
  );
};

export default Splat;
