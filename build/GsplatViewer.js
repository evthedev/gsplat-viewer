import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from '@react-three/fiber';
import Splat from './Splat';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { OrbitControls } from '@react-three/drei';
import Player from './Player';
import { Leva } from 'leva';
import useFileReader from './hooks/useFileReader';
import { ASSET_BASE_URL } from './utils/constants';
// Client's 'API key' must match one of these
const apiKeys = {
    bv: '7f8g9h0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    default: 'default',
};
const GsplatViewer = ({ file, fileUrl, isPremium = true, clientApiKey }) => {
    const [splatData, setSplatData] = useState();
    const [currentFile, setCurrentFile] = useState();
    const { loading, readFile } = useFileReader();
    // Allow dropzone
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0]; // Assuming only one file is uploaded
            await readFile(file, () => {
                setCurrentFile(file);
            });
        },
        noClick: true,
    });
    const isAuthenticated = clientApiKey && Object.values(apiKeys).includes(clientApiKey);
    // Read file and set splatData if currentFile is updated
    useEffect(() => {
        const asyncReadFile = async () => readFile(currentFile, (result) => {
            const arrayBufferResult = new Uint8Array(result);
            setSplatData(arrayBufferResult);
        });
        asyncReadFile();
    }, [currentFile]);
    // currentFile can either be fetched or dropped in dropzone
    useEffect(() => {
        setCurrentFile(file);
    }, [file]);
    // If fileUrl is provided, this is from html embed and we execute fetch
    useEffect(() => {
        const asyncFetchFile = async () => {
            if (fileUrl) {
                const response = await fetch(fileUrl, {
                    mode: 'cors',
                    credentials: 'omit',
                });
                if (response.status != 200 ||
                    response.body == null ||
                    response.headers == null ||
                    response.headers.get('content-length') == null) {
                    throw new Error(response.status + ' Unable to load ' + response.url);
                }
                const blob = await response.blob();
                const file = new File([blob], 'filename.ext', { type: blob.type });
                setCurrentFile(file);
            }
        };
        asyncFetchFile();
    }, [fileUrl]);
    return isAuthenticated ? (_jsxs("div", { className: "bg-gray-200 h-100 p-0 relative flex h-screen", ...getRootProps(), children: [_jsx(Leva, { titleBar: {
                    drag: true,
                    // position: { x: -430, y: 0 },
                }, collapsed: true, hidden: !isPremium }), loading && (_jsx("div", { className: "!absolute z-10 left-0 right-0 top-0 bottom-0 fade-in bg-gray-900 flex items-center justify-center opacity-80", children: _jsx("div", { className: "inline-block !absolute h-24 w-24 animate-spin rounded-full border-8 border-current border-r-transparent align-[-0.125em] text-gray-400 motion-reduce:animate-[spin_1s_linear_infinite]", role: "status" }) })), currentFile ? (_jsxs(Canvas, { className: "h-full w-full bg-black", gl: { antialias: true }, children: [_jsx(Player, {}), _jsx(OrbitControls, { enableDamping: false }), _jsx(Splat, { file: splatData })] })) : (_jsx("img", { src: `${ASSET_BASE_URL}death-star.jpg`, style: { height: '100%', width: '100%', objectFit: 'cover' } })), _jsx("input", { id: "dropzone-file", type: "file", className: "hidden", ...getInputProps() })] })) : (_jsx("div", { className: "h-100 p-0 relative flex h-screen items-center justify-center", children: _jsx("p", { className: "text-md text-gray-600", children: "Api key invalid." }) }));
};
export default GsplatViewer;
