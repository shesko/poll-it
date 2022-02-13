const _realSetTimeout = global.setTimeout

function continuouslyAdvanceTimers(): () => void {
    let isCancelled = false;

    async function advance() {
        while (!isCancelled) {
            jest.runOnlyPendingTimers();
            await new Promise(r => _realSetTimeout(r));
        }
    }

    advance().then();
    return () => {
        isCancelled = true;
    };
}

export default continuouslyAdvanceTimers;
