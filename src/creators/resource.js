import { combineReducers } from 'redux';
import upperCase from 'lodash.uppercase';
import capitalize from 'lodash.capitalize';
import without from 'lodash.without';
import omit from 'lodash.omit';
import { updateIn, push } from 'update-in';

import baseProvider from './base';

// Recource provider create the base constants, actions, and reducers
// necessary for SET, UPDATE, and DELETE
export default function resourceProvider(type, recordName, keyName) {
  // Create base provider
  const provider = baseProvider(type, recordName, keyName);

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
          return without(state, action.id);

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
          return omit(state, action.id);

        default:
          return state;
      }
    },
  });

  return provider;
}
