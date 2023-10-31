import { FC } from 'react';
export interface SceneFile {
    file: File;
    splatData: Uint8Array;
}
declare const GsplatViewer: FC<{
    file?: File | undefined;
    fileUrl?: RequestInfo | URL | undefined;
    isPremium?: boolean;
}>;
export default GsplatViewer;
