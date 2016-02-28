import { combineReducers } from 'redux';
import upperCase from 'lodash.uppercase';
import capitalize from 'lodash.capitalize';
import zipObject from 'lodash.zipobject';
import map from 'lodash.map';
import { updateIn, push, merge, dissoc } from 'update-in';

import baseProvider from './base';

// Recource provider create the base constants, actions, and reducers
// necessary for SET, UPDATE, and DELETE
export default function resourceProvider(type, recordName, recordKey) {
  // Create base provider
  const provider = baseProvider(type);

  // Add aditional provider keys
  const typeById = `${type}ById`;
  provider._providerRecordName = recordName;
  provider._providerRecordKey = recordKey;
  provider._additionalStateProps = [typeById, recordName];
  provider._mapStateToProps = requestedStateProps => (state, props) => {
    const providerState = state[type];

    const mapPropToState = prop => {
      const propsStateMap = {
        [type]: providerState.records,
        [typeById]: providerState.recordsById,
        [recordName]: providerState.recordsById[props[recordKey]],
      };

      return propsStateMap.hasOwnProperty(prop)
        ? propsStateMap[prop]
        : providerState[prop]
      ;
    };

    return zipObject(requestedStateProps, map(requestedStateProps, mapPropToState));
  };

  // Create objects for constants, actions, reducers
  provider.constants = {};
  provider.actions = {};
  provider.reducers = {};

  // Constants
  const SET = `SET_${upperCase(recordName)}`;
  const UPDATE = `UPDATE_${upperCase(recordName)}`;
  const DELETE = `DELETE_${upperCase(recordName)}`;

  provider.constants[SET] = SET;
  provider.constants[UPDATE] = UPDATE;
  provider.constants[DELETE] = DELETE;

  // Actions
  const setFn = (id, payload) => ({
    type: SET,
    id,
    payload,
  });
  const updateFn = (id, payload) => ({
    type: UPDATE,
    id,
    payload,
  });
  const deleteFn = (id) => ({
    type: DELETE,
    id,
  });

  provider.actions[`set${capitalize(recordName)}`] = setFn;
  provider.actions[`update${capitalize(recordName)}`] = updateFn;
  provider.actions[`delete${capitalize(recordName)}`] = deleteFn;

  // Reducers
  provider.reducers = combineReducers({
    records(state = [], action) {
      switch (action.type) {
        case SET:
          return push(state, [action.id]);

        case DELETE:
          return dissoc(state, state.indexOf(action.id));

        default:
          return state;
      }
    },

    recordsById(state = {}, action) {
      switch (action.type) {
        case SET:
          return updateIn(state, [action.id], v => ({
            id: action.id,
            ...action.payload
          }));

        case UPDATE:
          return updateIn(state, [action.id], merge, action.payload);

        case DELETE:
          return dissoc(state, action.id);

        default:
          return state;
      }
    },
  });

  return provider;
}
