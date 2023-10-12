import '@hcaptcha/types';

export interface IScriptParams {
    scriptLocation?: HTMLElement;
    apihost?: string;
    loadAsync?: boolean;
    cleanup?: boolean;
    query?: string
    crossOrigin?: string
}

export interface ILoaderParams extends IScriptParams {
    render?: 'explicit';
    sentry?: boolean;
    custom?: boolean;
    assethost?: string;
    imghost?: string;
    reportapi?: string;
    endpoint?: string;
    host?: string;
}