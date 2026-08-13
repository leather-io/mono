import * as yup from 'yup';

import type { ComplianceScreeningPoint } from '@leather.io/analytics';
import { getComplianceService } from '@leather.io/services';
import { isEmptyString, isUndefined } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

export function complianceValidator(
  shouldCheckCompliance: yup.StringSchema<string | undefined, yup.AnyObject>,
  screeningPoint: ComplianceScreeningPoint
) {
  return yup.string().test({
    message: 'Compliance check failed',
    async test(value) {
      if (!shouldCheckCompliance.isValidSync(value)) return true;
      if (isUndefined(value) || isEmptyString(value)) return true;

      const result = await getComplianceService().checkAddressCompliance(value);
      if (result.status === 'non_compliant') {
        analytics.track('non_compliant_entity_detected', {
          address: value,
          reason: result.reason,
          screeningPoint,
        });
        return false;
      }
      if (result.status === 'unavailable') {
        analytics.track('compliance_check_unavailable', {
          address: value,
          reason: result.reason,
          screeningPoint,
        });
      }
      return true;
    },
  });
}
