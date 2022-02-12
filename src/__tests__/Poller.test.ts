import Poller from '../Poller'
import { v4 as uuidv4 } from 'uuid';

describe('Poller', () => {
    it('should execute the given function and return its result', async () => {
        const output = uuidv4().toString();
        const fn = jest.fn(() => output);
        const poller = new Poller({ fn, continuePolling: () => false });

        const result = await poller.poll();

        expect(result).toEqual(output);
    });

    it('should continue polling until continuePolling resolved to false', async () => {
        const output = uuidv4().toString();
        let callsCount = 0
        const continuePolling = () => {
            callsCount++;
            return callsCount < 3;
        }
        const fn = jest.fn(async () => output);
        const poller = new Poller({ fn, continuePolling });

        const result = await poller.poll();

        expect(result).toEqual(output);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should stop and throw an error if the given function throws an error', async () => {
        const error = new Error('Something went wrong :( ');
        const fn = jest.fn(() => { throw error; });
        const poller = new Poller({ fn })

        await expect(() => poller.poll()).rejects.toEqual(error);
    })
})
