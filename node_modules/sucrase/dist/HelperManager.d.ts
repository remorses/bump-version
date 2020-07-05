import type NameManager from "./NameManager";
declare const HELPERS: {
    interopRequireWildcard: string;
    interopRequireDefault: string;
    createNamedExportFrom: string;
    createStarExport: string;
    nullishCoalesce: string;
    asyncNullishCoalesce: string;
    optionalChain: string;
    asyncOptionalChain: string;
    optionalChainDelete: string;
    asyncOptionalChainDelete: string;
};
export declare class HelperManager {
    readonly nameManager: NameManager;
    helperNames: {
        [baseName in keyof typeof HELPERS]?: string;
    };
    constructor(nameManager: NameManager);
    getHelperName(baseName: keyof typeof HELPERS): string;
    emitHelpers(): string;
}
export {};
