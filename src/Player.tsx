import React, { FC, useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyPress } from 'react-use';

interface PlayerProps {
  movementSpeed?: number
}
const Player: FC<PlayerProps> = ({movementSpeed = 0.3}) => {
  const { camera } = useThree();
  const moveDirection = useRef(new THREE.Vector3());
  const isShiftPressed = useKeyPress(
    (event) =>
      event.key === "Shift"
  )[0];
  const absoluteMovementSpeed = isShiftPressed ? 4 * movementSpeed : movementSpeed

  useFrame(() => {
    // Rotate move direction to align with camera rotation
    const dir = moveDirection.current.clone().applyQuaternion(camera.quaternion);

    // Update camera position
    camera.position.add(dir.multiplyScalar(absoluteMovementSpeed));
  });

  const onKeyDown = (event) => {
    switch (event.code) {
      case 'KeyW':
        moveDirection.current.z = -absoluteMovementSpeed;
        break;
      case 'KeyS':
        moveDirection.current.z = absoluteMovementSpeed;
        break;
      case 'KeyA':
        moveDirection.current.x = -absoluteMovementSpeed;
        break;
      case 'KeyD':
        moveDirection.current.x = absoluteMovementSpeed;
        break;
      case 'KeyR':
        moveDirection.current.y = absoluteMovementSpeed;
        break;
      case 'KeyF':
        moveDirection.current.y = -absoluteMovementSpeed;
        break;
      default:
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'KeyS':
        moveDirection.current.z = 0;
        break;
      case 'KeyA':
      case 'KeyD':
        moveDirection.current.x = 0;
        break;
      case 'KeyR':
      case 'KeyF':
        moveDirection.current.y = 0;
        break;
      default:
        break;
    }
  };


  useEffect(() => {
    // window.addEventListener('mousedown', onMouseDown);
    // window.addEventListener('mousemove', onMouseMove);
    // window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      // window.removeEventListener('mousedown', onMouseDown);
      // window.removeEventListener('mousemove', onMouseMove);
      // window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return null;
}

export default Player;
