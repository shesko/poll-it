# Poller Bear

:warning: THIS LIBRARY STILL HAS LIMITED FEATURES AND IS NOT READY FOR PRODUCTION :warning:

A simple poller that can be used in both JavaScript and TypeScript projects. 
With "Poller Bear" you can continuously perform an operation indefinitely or until a condition is met.

## Usage

### Infinite polling
Polling can be achieved with the `Poller` class. The most basic initialisation can be achieved by 
passing a `config` object containing the function that needs to be executed by the poller. 
With this basic configuration, the `Poller.poll()` can be called to infinitely execute 
the provided function.

```typescript
const config = { fn: () => console.log('Polling...') }
const poller = new Poller<void>(config);
poller.poll().resolve();
```

### Stop polling on custom condition
In some cases you may wish to poll until a certain condition is met. For example, you may want to 
poll until an api responds with a certain status. This can be achieved by providing a function
to the `continuePolling` field of our Poller `config` object

```typescript
const fn = (): ApiResponse => ApiService.get();
const continuePolling = (apiResponse: ApiResponse) => apiResponse.status === 'SUCCESS';

const config = { fn, continuePolling }
const poller = new Poller<ApiResponse>(config);

const response = await poller.poll();
```

Once `continuePolling` returns `true`, the poller will stop polling and will return 
the result of your target function. 







