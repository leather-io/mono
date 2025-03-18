import { StacksNetwork } from '@stacks/network';

// import { analytics } from '@utils/analytics';
import { EditingFormValues, PoolWrapperAllowanceState } from './types';
import { HandleAllowContractCallerArgs } from './utils-allow-contract-caller';
import {
  getNetworkInstance,
  getPoxWrapperContract,
  requiresAllowContractCaller,
} from './utils-preset-pools';

interface CreateHandleSubmitArgs {
  hasUserConfirmedPoolWrapperContract: PoolWrapperAllowanceState;
  setHasUserConfirmedPoolWrapperContract: React.Dispatch<
    React.SetStateAction<PoolWrapperAllowanceState>
  >;
  handleDelegateStxSubmit: (val: EditingFormValues, onFinish?: () => void) => Promise<void>;
  handleAllowContractCallerSubmit: ({
    poxWrapperContract,
    onFinish,
  }: HandleAllowContractCallerArgs) => Promise<void>;
  network: StacksNetwork;
}

export function createHandleSubmit({
  handleDelegateStxSubmit,
  handleAllowContractCallerSubmit,
  hasUserConfirmedPoolWrapperContract,
  setHasUserConfirmedPoolWrapperContract,
  network,
}: CreateHandleSubmitArgs) {
  return async function handleSubmit(values: EditingFormValues) {
    if (values.poolName && requiresAllowContractCaller(values.poolName)) {
      const poxWrapperContract = getPoxWrapperContract(values.poolName, network);
      const networkInstance = getNetworkInstance(network);

      // analytics.untypedTrack('stacking_initiated', {
      //   pool_or_protocol_name: values.poolName,
      //   network: networkInstance,
      //   stacking_type: 'pooled',
      // });

      // eslint-disable-next-line func-style
      const trackStackCompleted = () => {
        // analytics.untypedTrack('stacking_completed', {
        //   pool_or_protocol_name: values.poolName,
        //   network: networkInstance,
        //   stacking_type: 'pooled',
        // });
      };

      if (hasUserConfirmedPoolWrapperContract[networkInstance]?.[poxWrapperContract]) {
        await handleDelegateStxSubmit(values, trackStackCompleted);
        return;
      } else {
        await handleAllowContractCallerSubmit({
          poxWrapperContract,
          onFinish: () => {
            setHasUserConfirmedPoolWrapperContract({
              ...hasUserConfirmedPoolWrapperContract,
              [networkInstance]: {
                ...hasUserConfirmedPoolWrapperContract[networkInstance],
                [poxWrapperContract]: true,
              },
            });
            trackStackCompleted();
          },
        });
        return;
      }
    } else {
      await handleDelegateStxSubmit(values);
      return;
    }
  };
}
