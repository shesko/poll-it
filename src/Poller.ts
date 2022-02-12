type PromiseResolve<T> = (result: T) => void
type PromiseReject = (error: any) => void

export const TIMEOUT_ERROR = new Error('TIMEOUT: the poller has reached the maximum number of retries')

export default class Poller<T> {
    private readonly fn: () => T;
    private readonly continuePolling: (result?: T) => boolean = () => true;
    private readonly maxRetries: number | null;

    constructor(config: PollerConfig<T>) {
        this.fn = config.fn
        this.continuePolling = config.continuePolling || this.continuePolling;
        this.maxRetries = config.maxRetries || null;
    }

    async poll(): Promise<T> {
        let retriesCount = 0
        const execute = async (resolve: PromiseResolve<T>, reject: PromiseReject) => {
            try {
                if(this.maxRetries && retriesCount >= this.maxRetries) {
                    reject(TIMEOUT_ERROR);
                    return
                }

                const result = await this.fn();
                retriesCount++;

                if (!this.continuePolling(result)) {
                    resolve(result);
                } else {
                    setTimeout(() => execute(resolve, reject));
                }
            } catch(e) {
                reject(e);
            }
        };

        return new Promise(execute);
    }
}

export interface PollerConfig<T> {
    fn: () => T,
    continuePolling?: (result?: T) => boolean,
    maxRetries?: number
}

