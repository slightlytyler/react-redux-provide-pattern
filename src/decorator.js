import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import keys from 'lodash.keys';
import intersection from 'lodash.intersection';
import zipObject from 'lodash.zipobject';
import map from 'lodash.map';

export default function provide(provider, merge) {
  const { _providerType, reducers, actions } = provider;

  let availableStateProps = [_providerType];
  if (provider._additionalStateProps) {
    availableStateProps.concat(provider._additionalStateProps);
  }
  if (typeof reducers === 'object') {
    availableStateProps.push(keys(provider.reducers));
  }
  const availableDispatchProps = keys(provider.actions);

  return Component => {
    const requestedProps = keys(Component.propTypes);
    const requestedStateProps = intersection(requestedProps, availableStateProps);
    const requestedDispatchProps = intersection(requestedProps, availableDispatchProps);

    let mapStateToProps;
    if (provider._mapStateToProps) {
      mapStateToProps = provider._mapStateToProps(requestedStateProps);
    }
    else {
      mapStateToProps = (state, props) => {
        const providerState = state[_providerType];

        const mapPropToState = prop => {
          const propsStateMap = {
            [_providerType]: providerState,
          };

          return propsStateMap.hasOwnProperty(prop)
            ? propsStateMap[prop]
            : providerState[prop]
          ;
        };

        return zipObject(requestedStateProps, map(requestedStateProps, mapPropToState));
      };
    }

    const mapDispatchToProps = dispatch => {
      const mapPropToAction = prop => provider.actions[prop];

      return bindActionCreators(
        zipObject(requestedDispatchProps, map(requestedDispatchProps, mapPropToAction)),
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