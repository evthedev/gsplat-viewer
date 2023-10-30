/// <reference lib="webworker" />
type ViewProj = number[];
declare let maxSplats: number;
declare let buffer: ArrayBuffer;
declare let vertexCount: number;
declare let viewProj: ViewProj;
declare const rowLength: number;
declare let depthMix: BigInt64Array;
declare let lastProj: ViewProj;
declare const runSort: (viewProj: ViewProj) => void;
declare const throttledSort: () => void;
declare let sortRunning: boolean;
