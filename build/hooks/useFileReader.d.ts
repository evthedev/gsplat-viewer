declare const useFileReader: () => {
    loading: boolean;
    readFile: (file: File | string | undefined, onReadComplete?: ((result: ArrayBuffer | undefined | null | string) => void) | undefined) => Promise<void>;
};
export default useFileReader;
