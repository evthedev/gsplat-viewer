import { useState } from 'react';
import convertPlyToSplat from '../utils/convertPlyToSplat'; //  TODO update to import from npm module

const useFileReader = () => {
  const [loading, setLoading] = useState(false);

  const readFile = async (
    file: File | string,
    onReadComplete?: (result: ArrayBuffer | undefined | null | string) => void
  ) => {
    console.log('🚀 ~ file: useFileReader.ts:11 ~ useFileReader ~ file:', file);
    let reader: FileReader | null = new FileReader();

    reader.onload = () => {
      const splitFileName = file.name.split('.');
      const fileExtension = splitFileName?.[splitFileName.length - 1];
      const result =
        fileExtension === 'ply'
          ? convertPlyToSplat(reader?.result)
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

    file && reader.readAsArrayBuffer(file);
  };

  return {
    loading,
    readFile,
  };
};

export default useFileReader;
