import { combineReducers } from 'redux';
import upperCase from 'lodash.uppercase';
import capitalize from 'lodash.capitalize';
import zipObject from 'lodash.zipobject';
import map from 'lodash.map';
import mapValues from 'lodash.mapvalues';
import filter from 'lodash.filter';
import pickBy from 'lodash.pickby'
import { updateIn, push, merge, dissoc } from 'update-in';

import baseProvider from './base';

// Recource provider create the base constants, actions, and reducers
// necessary for SET, UPDATE, and DELETE
export default function resourceProvider(type, recordName, recordKey) {
  // Create base provider
  const provider = baseProvider(type);

  // Add aditional provider keys
  const typeById = `${type}ById`;
  provider._providerTypeById = typeById;
  provider._providerRecordName = recordName;
  provider._providerRecordKey = recordKey;

  // Constants
  const SET = `SET_${upperCase(recordName)}`;
  const UPDATE = `UPDATE_${upperCase(recordName)}`;
  const UPDATE_MANY = `UPDATE_MANY_${upperCase(type)}`;
  const DELETE = `DELETE_${upperCase(recordName)}`;
  const DELETE_MANY = `DELETE_MANY_${upperCase(type)}`;

  provider.constants[SET] = SET;
  provider.constants[UPDATE] = UPDATE;
  provider.constants[UPDATE_MANY] = UPDATE_MANY;
  provider.constants[DELETE] = DELETE;
  provider.constants[DELETE_MANY] = DELETE_MANY;

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
  const updateManyFn = (ids, payload) => ({
    type: UPDATE_MANY,
    ids,
    payload,
  });
  const deleteFn = (id) => ({
    type: DELETE,
    id,
  });
  const deleteManyFn = ids => ({
    type: DELETE_MANY,
    ids,
  });

  provider.actions[`set${capitalize(recordName)}`] = setFn;
  provider.actions[`update${capitalize(recordName)}`] = updateFn;
  provider.actions[`updateMany${capitalize(recordName)}`] = updateManyFn;
  provider.actions[`delete${capitalize(recordName)}`] = deleteFn;
  provider.actions[`deleteMany${capitalize(recordName)}`] = deleteManyFn;

  // Reducers
  provider.reducers = {
    records(state = [], action) {
      switch (action.type) {
        case SET:
          return push(state, [action.id]);

        case DELETE:
          return dissoc(state, state.indexOf(action.id));

        case DELETE_MANY:
          return action.ids.length
            ? filter(state, id => action.ids.indexOf(id) === -1)
            : state
          ;

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

        case UPDATE_MANY:
          return mapValues(state, (todo, id) =>
            action.ids.indexOf(id) !== -1 ? merge(todo, action.payload) : todo
          );

        case DELETE:
          return dissoc(state, action.id);

        case DELETE_MANY:
          return pickBy(state, (todo, id) => action.ids.indexOf(id) === -1)

        default:
          return state;
      }
    },
  };

  // Selectors
  provider.selectors.records = state => state.todos.records;
  provider.selectors.recordsById = state => state.todos.recordsById;

  // Augment state mapping
  provider._additionalStateProps = [typeById, recordName];
  provider._mapStateToProps = requestedStateProps => (state, props) => {
    const providerState = state[type];

    const mapPropToState = prop => {
      const propsStateMap = {
        [type]: providerState.records,
        [typeById]: providerState.recordsById,
        [recordName]: providerState.recordsById[props[recordKey]],
      };

      if (propsStateMap.hasOwnProperty(prop)) {
        return propsStateMap[prop];
      }
      else if (provider.selectors.hasOwnProperty(prop)) {
        return provider.selectors[prop](state);
      }
      else {
        return providerState[prop];
      }
    };

    return zipObject(requestedStateProps, map(requestedStateProps, mapPropToState));
  };

  return provider;
}
