import { EntityState, PayloadAction } from '@reduxjs/toolkit';
import z from 'zod';

type AdapterMethod<T> = (state: EntityState<T, string>, args: any) => void;

export function handleEntityActionWith<State, Payload, R extends AdapterMethod<State>>(
  adapterMethod: R,
  // Payload selector fn expected to return the value passed to second
  // parameter of the adapter method
  payloadSelector: (
    payload: Payload,
    state: EntityState<State, string>
  ) => Parameters<R>[1]['payload']
) {
  return (state: EntityState<State, string>, action: PayloadAction<Payload>) => {
    const selectedPayload = payloadSelector(action.payload, state);
    adapterMethod(state, selectedPayload);
  };
}

export function entitySchema<T extends z.ZodTypeAny>(genericEntitySchema: T) {
  return z.object({
    ids: z.array(z.string()),
    entities: z.record(z.string(), genericEntitySchema),
  });
}
