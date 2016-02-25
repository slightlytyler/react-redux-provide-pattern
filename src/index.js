import decorator from './decorator';
import baseCreator from './creators/base';
import resourceCreator from './creators/resource';

export {
  decorator as provide,
  baseCreator as createProvider,
  resourceCreator as createResourceProvider,
};
