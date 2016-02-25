// Create the baes provider object
// 'constants', 'actions', 'reducers', and 'selectors'
// will be attached after instantiation
export default function baseProvider(type, recordName = type.slice(0, -1), keyName = `${recordName}Key`) {
  return {
    type,
    recordName,
    keyName,
  };
}
