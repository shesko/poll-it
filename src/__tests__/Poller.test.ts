import Poller from '../Poller'

describe('Poller', () => {
    it('should return true', () => {
        expect((new Poller()).poll()).toBe(true);
    });
})

