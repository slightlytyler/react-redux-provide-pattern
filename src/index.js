import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  keys,
  map,
  zipObject,
  omit,
  intersection,
} from 'lodash';

// Create the baes provider object
// 'constants', 'actions', 'reducers', and 'selectors'
// will be attached after instantiation
export function createProvider(type, recordName = type.slice(0, -1), keyName = `${recordName}Key`) {
  return {
    type,
    recordName,
    keyName,
  };
}

// Decorator function
// Accepts the provider object and optional merge function
// Returns a wrapper function that accepts a Component instance as the argument
export function provide(provider, merge) {
  const { type, recordName, keyName } = provider;
  const typeById = `${type}ById`;

  const allowedStateProps = [
    type,
    typeById,
    recordName,
    ...keys(omit(provider.reducers, ['records', 'recordsById'])),
  ];
  const allowedDispatchProps = keys(provider.actions);

  // Return a connected, wrapped HOC
  return function wrap(Component) {
    const requestedProps = keys(Component.propTypes);
    const requestedStateProps = intersection(requestedProps, allowedStateProps);
    const requestedDispatchProps = intersection(requestedProps, allowedDispatchProps);

    const mapStateToProps = state => {
      const providerState = state[type];

      // Create inital object mapping requested state props to provider state
      const mappedStateProps = zipObject(requestedStateProps, map(requestedStateProps, prop => {
        switch (true) {
          // Case where we map 'type' i.e. 'todos'
          // to 'records', a list of record ids
          case prop === type:
            return providerState.records;

          // Case where we mape 'typeById' i.e. 'todosById'
          // to 'recordsById', a key/value map for ids/records
          case prop === typeById:
            return providerState.recordsById;

          // Default case maps requested state props to
          // root level keys of provider state
          default:
            return providerState[prop];
        }
      }));

      // If 'recordName' i.e. 'todo' is a requested state prop
      if (requestedStateProps.indexOf(recordName) !== -1) {
        // and 'typeById' i.e. 'todosById' is not present in mapped state
        if (!(typeById in mapStateToProps)) {
          // We bind 'typeById' i.e. 'todosById' to the mapped state
          // The HOC will use this plus the passed `keyName` i.e. 'todoKey'
          // to select the correct record
          mappedStateProps[typeById] = providerState.recordsById;
        }
      }

      return mappedStateProps;
    };

    // Bind the mapping of the requested dispatch props to
    // the actions available on the provider
    const mapDispatchToProps = dispatch => (
      bindActionCreators(
        zipObject(
          requestedDispatchProps,
          map(requestedDispatchProps, prop => provider.actions[prop])
        ),
        dispatch
      )
    );

    // Wraping HOC
    class WrappedComponent extends React.Component {
      render() {
        // If 'recordName' i.e. 'todo' is in the requested state props
        // we select it using the passed 'keyName' and the 'typeById' records
        if (requestedStateProps.indexOf(recordName) !== -1) {
          const props = {
            ...this.props,
            [recordName]: this.props[typeById][this.props[keyName]],
          };

          // If the user did not request the 'typeById' i.e. 'todosById'
          // we remove it from the passed props
          if (requestedStateProps.indexOf(typeById) === -1) {
            return <Component {...omit(props, typeById)} />;
          }

          return <Component {...props} />;
        }

        // Else just passed the props
        return <Component {...this.props} />;
      }
    }

    return connect(
      mapStateToProps,
      mapDispatchToProps,
      merge
    )(WrappedComponent);
  };
}
