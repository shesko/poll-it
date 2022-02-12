type PromiseResolve<T> = (result: T) => void
type PromiseReject = (error: any) => void

export default class Poller<T> {
    private readonly fn: () => T;
    private readonly continuePolling: (result?: T) => boolean = () => true;

    constructor(config: PollerConfig<T>) {
        this.fn = config.fn
        this.continuePolling = config.continuePolling || this.continuePolling;
    }

    async poll(): Promise<T> {
        const execute = async (resolve: PromiseResolve<T>, reject: PromiseReject) => {
            try {
                const result = this.fn();

                if (this.continuePolling(result)) {
                    setTimeout(() => execute(resolve, reject));
                } else {
                    resolve(result);
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
    continuePolling?: (result?: T) => boolean
}
