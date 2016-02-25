import { combineReducers } from 'redux';
import upperCase from 'lodash.uppercase';
import capitalize from 'lodash.capitalize';

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
          return [...state, action.id];

        case DELETE:
          return state.splice(state.indexOf(action.id), 1);

        default:
          return state;
      }
    },

    recordsById(state = {}, action) {
      switch (action.type) {
        case SET:
          return Object.assign({}, state, {
            [action.id]: {
              id: action.id,
              ...action.payload,
            },
          });

        case UPDATE:
          return Object.assign({}, state, {
            [action.id]: Object.assign({}, state[actions.id], action.payload),
          });

        case DELETE: {
          const newState = Object.assign({}, state);
          delete newState[action.id];
          return newState;
        }

        default:
          return state;
      }
    },
  });

  return provider;
}
