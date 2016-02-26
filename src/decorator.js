import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import keys from 'lodash.keys';
import intersection from 'lodash.intersection';
import zipObject from 'lodash.zipobject';
import map from 'lodash.map';

export default function provide(provider, merge) {
  const { _providerType, reducers, actions } = provider;

  let availableStateProps = [_providerType];
  if (typeof reducers === 'object') {
    availableStateProps.push(keys(provider.reducers));
  }
  const availableDispatchProps = keys(provider.actions);

  return Component => {
    const requestedProps = keys(Component.propTypes);
    const requestedStateProps = intersection(requestedProps, availableStateProps);
    const requestedDispatchProps = intersection(requestedProps, availableDispatchProps);

    const mapStateToProps = (state, props) => {
      const providerState = state[_providerType];

      const mapProp = prop => {
        switch (prop) {
          case _providerType:
            return providerState;

          default:
            return providerState[prop];
        }
      };

      return zipObject(requestedStateProps, map(requestedStateProps, mapProp));
    };

    const mapDispatchToProps = dispatch => {
      const mapProp = prop => provider.actions[prop];

      return bindActionCreators(
        zipObject(requestedDispatchProps, map(requestedDispatchProps, mapProp)),
        dispatch
      );
    };

    return connect(
      mapStateToProps,
      mapDispatchToProps,
      merge
    )(Component);
  };
}