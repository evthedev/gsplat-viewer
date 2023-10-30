import { useState } from 'react';
import convertPlyToSplat from '../utils/convertPlyToSplat'; //  TODO update to import from npm module

const useFileReader = () => {
  const [loading, setLoading] = useState(false);

  const readFile = async (
    file: File | string | undefined,
    onReadComplete?: (result: ArrayBuffer | undefined | null | string) => void
  ) => {
    let reader: FileReader | null = new FileReader();

    reader.onload = () => {
      const splitFileName = (file as File)?.name.split('.');
      const fileExtension = splitFileName?.[splitFileName.length - 1];
      const result =
        fileExtension === 'ply'
          ? convertPlyToSplat(reader?.result as ArrayBufferLike)
          : reader?.result;

      onReadComplete?.(result);
    };

    reader.onloadstart = () => {
      setLoading(true);
    };

    reader.onloadend = () => {
      setLoading(false);
      reader = null;
    };

    file && reader.readAsArrayBuffer(file as Blob);
  };

  return {
    loading,
    readFile,
  };
};

export default useFileReader;
