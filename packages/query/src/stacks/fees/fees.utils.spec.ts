import { getFeeEstimationsBasedOnDefaultMinMaxValues } from './fees.utils';

const hiroFees = [
  { fee: 2499, fee_rate: 0 },
  { fee: 3500, fee_rate: 0 },
  { fee: 6000, fee_rate: 0 },
];

const defaultFees = {
  low: {
    min: 2500,
    max: 2999,
  },
  standard: {
    min: 3000,
    max: 10000,
  },
  high: {
    min: 10000,
    max: 1000001,
  },
};

const expectedResult = ['2499', '3500', '10000'];

describe(getFeeEstimationsBasedOnDefaultMinMaxValues.name, () => {
  it('should return proper fee estimations', () => {
    const result = getFeeEstimationsBasedOnDefaultMinMaxValues({
      defaultEstimations: defaultFees,
      hiroFeeEstimations: hiroFees,
    });

    const lowFeeResult = result[0].fee.amount.toString();
    const standardFeeResult = result[1].fee.amount.toString();
    const highFeeResult = result[2].fee.amount.toString();

    // expect the lowest for the low estimation
    expect(lowFeeResult).toEqual(expectedResult[0]);
    // if hiro fee is between the min max estimation range, return the hiro fee
    expect(standardFeeResult).toEqual(expectedResult[1]);
    // if high hiro fee estimation is greater than the max estimation range, return the max estimation range
    expect(highFeeResult).toEqual(expectedResult[2]);
  });
});
