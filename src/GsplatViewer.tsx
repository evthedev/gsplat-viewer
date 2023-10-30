import { Canvas } from '@react-three/fiber';
import Splat from './Splat';
import { FC, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { OrbitControls } from '@react-three/drei';
import Player from './Player';
import { Leva } from 'leva';
import useFileReader from './hooks/useFileReader';

export interface SceneFile {
  file: File;
  splatData: Uint8Array;
}

const GsplatViewer: FC<{ file?: File | undefined; isPremium?: boolean }> = ({
  file,
  isPremium = true,
}) => {
  const [splatData, setSplatData] = useState<Uint8Array | undefined>();
  const [currentFile, setCurrentFile] = useState<File | undefined>();
  const { loading, readFile } = useFileReader();

  // Allow dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]; // Assuming only one file is uploaded

      await readFile(file, () => {
        setCurrentFile(file);
      });
    },
    noClick: true,
  });

  // Read file and set splatData if currentFile is updated
  useEffect(() => {
    const asyncReadFile = async () =>
      readFile(currentFile, (result) => {
        const arrayBufferResult = new Uint8Array(result as ArrayBuffer);
        setSplatData(arrayBufferResult);
      });
    asyncReadFile();
  }, [currentFile]);

  // currentFile can either be fetched or dropped in dropzone
  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  return (
    <div
      className="bg-gray-200 h-100 p-0 relative flex h-screen"
      {...getRootProps()}
    >
      <Leva
        titleBar={{
          drag: true,
          position: { x: -430, y: 0 },
        }}
        hidden={!isPremium}
      />
      {loading && (
        <div className="!absolute z-10 left-0 right-0 top-0 bottom-0 fade-in bg-gray-900 flex items-center justify-center opacity-80">
          <div
            className="inline-block !absolute h-24 w-24 animate-spin rounded-full border-8 border-current border-r-transparent align-[-0.125em] text-gray-400 motion-reduce:animate-[spin_1s_linear_infinite]"
            role="status"
          />
        </div>
      )}
      {currentFile ? (
        <Canvas className="h-full w-full bg-black" gl={{ antialias: true }}>
          <Player />
          <OrbitControls enableDamping={false} />
          <Splat file={splatData} />
        </Canvas>
      ) : (
        <img
          src="/death-star.jpg"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
      )}
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        {...getInputProps()}
      />
    </div>
  );
};

export default GsplatViewer;
