import Poller, {MAX_RETRIES_ERROR, TIMEOUT_ERROR} from '../Poller'
import { v4 as uuidv4 } from 'uuid';
import continuouslyAdvanceTimers from "./helpers/mockTimerHelper";

describe('Poller', () => {
    let output: string;
    let fn: () => string;

    beforeEach(() => {
        output = uuidv4().toString();
        fn = jest.fn(() => output);
    })

    it('should execute the given function and return its result', async () => {
        const poller = new Poller({ fn, continuePolling: () => false });

        const result = await poller.poll();

        expect(result).toEqual(output);
    });

    it('should continue polling until continuePolling resolved to false', async () => {
        let callsCount = 0
        const continuePolling = () => {
            callsCount++;
            return callsCount < 3;
        }
        const poller = new Poller({ fn, continuePolling });

        const result = await poller.poll();

        expect(result).toEqual(output);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should stop and throw an error if the given function throws an error', async () => {
        const error = new Error('Something went wrong :( ');
        const errorFn = jest.fn(() => { throw error; });
        const poller = new Poller({ fn: errorFn })

        await expect(() => poller.poll()).rejects.toEqual(error);
    })

    it('should stop and throw and error when it reaches the defined maximum number of calls', async () => {
        const maxRetries = 5
        const poller = new Poller({ fn, maxRetries });

        await expect(() => poller.poll()).rejects.toEqual(MAX_RETRIES_ERROR);
        expect(fn).toHaveBeenCalledTimes(5);
    })

    it('should stop polling and throw a timeout error if more time has elapsed than the defined amount', async () => {
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => 1644763429276);

        const elapseASecond = jest.fn(() => {
            const currentMockTimestamp = Date.now();
            Date.now = jest.fn(() => currentMockTimestamp + 1000);
        })

        const timeout = { seconds: 25 }
        const poller = new Poller({ fn: elapseASecond, timeout });

        await expect(() => poller.poll()).rejects.toEqual(TIMEOUT_ERROR);
        expect(elapseASecond).toHaveBeenCalledTimes(26);

        Date.now = originalDateNow;
    });

    it('should poll at a certain interval if the interval config has been defined', async () => {
        jest.useFakeTimers();
        jest.spyOn(global as any, 'setTimeout');
        const cancelAdvance = continuouslyAdvanceTimers();

        const interval = 3000

        let callsCount = 0
        const continuePolling = () => {
            callsCount++;
            return callsCount < 2;
        }
        const poller = new Poller({ fn, continuePolling, interval: { ms: interval } });
        await poller.poll();

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), interval);
        cancelAdvance()
    })
})
