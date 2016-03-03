// Create the baes provider object
export default function baseProvider(type) {
  return {
    _providerType: type,
    constants: {},
    actions: {},
    reducers: {},
    selectors: {},
  };
}
