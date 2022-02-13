type PromiseResolve<T> = (result: T) => void
type PromiseReject = (error: any) => void

export const MAX_RETRIES_ERROR = new Error('MAX RETRIES: the poller has reached the maximum number of retries')
export const TIMEOUT_ERROR = new Error('TIMEOUT: the poller has reached the defined timeout')

export default class Poller<T> {
    private readonly fn: () => T;
    private readonly continuePolling: (result?: T) => boolean = () => true;
    private readonly maxRetries: number | null;
    private readonly timeout: TimeoutConfig | null;
    private readonly interval: IntervalConfig;

    constructor(config: PollerConfig<T>) {
        this.fn = config.fn
        this.continuePolling = config.continuePolling || this.continuePolling;
        this.maxRetries = config.maxRetries || null;
        this.timeout = config.timeout || null;
        this.interval = config.interval || { ms: 0 };
    }

    async poll(): Promise<T> {
        let retriesCount = 0
        const startTimestamp = Date.now();
        const execute = async (resolve: PromiseResolve<T>, reject: PromiseReject) => {
            try {
                if(this.maxRetries && retriesCount >= this.maxRetries) {
                    reject(MAX_RETRIES_ERROR);
                    return;
                }

                const timeElapsed = (Date.now() - startTimestamp) / 1000;
                if(this.timeout?.seconds && this.timeout.seconds < timeElapsed) {
                    reject(TIMEOUT_ERROR);
                    return;
                }


                const result = await this.fn();
                retriesCount++;

                if (!this.continuePolling(result)) {
                    resolve(result);
                } else {
                    setTimeout(() => execute(resolve, reject), this.interval.ms);
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
    timeout?: TimeoutConfig,
    maxRetries?: number,
    interval?: IntervalConfig
}

export interface TimeoutConfig {
    seconds: number
}

export interface IntervalConfig {
    ms: number
}

