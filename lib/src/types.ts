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
    recaptchacompat?: string;
    hl?: string;
    cleanup?: boolean;
}

export interface SentryHub {
    addBreadcrumb: (params: object) => void,
    captureException: (params: any) => void,
    captureMessage: (message: string) => void,
    setTag: (source?: string) => void,
}
