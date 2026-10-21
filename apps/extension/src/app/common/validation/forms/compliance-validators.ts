import { z } from 'zod';

import type { ComplianceScreeningPoint } from '@leather.io/analytics';
import { createAddressComplianceCheckQueryConfig } from '@leather.io/queries';
import { type UserSettings, isOfflineComplianceCheckReason } from '@leather.io/services';
import { isEmptyString, isUndefined } from '@leather.io/utils';

import { stringField } from '@shared/forms/field-schemas';
import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';

export function complianceValidator(
  shouldCheckCompliance: z.core.$ZodCheck<string | undefined>,
  screeningPoint: ComplianceScreeningPoint,
  settings: UserSettings
) {
  const shouldCheckComplianceSchema = stringField().check(shouldCheckCompliance);
  return z.refine<string | undefined>(
    async value => {
      if (!shouldCheckComplianceSchema.safeParse(value).success) return true;
      if (isUndefined(value) || isEmptyString(value)) return true;

      const result = await queryClient.fetchQuery(
        createAddressComplianceCheckQueryConfig(value, settings)
      );
      if (result.status === 'non_compliant') {
        analytics.track('non_compliant_entity_detected', {
          address: value,
          reason: result.reason,
          screeningPoint,
        });
        return false;
      }
      if (result.status === 'unavailable' && !isOfflineComplianceCheckReason(result.reason)) {
        analytics.track('compliance_check_unavailable', {
          address: value,
          reason: result.reason,
          screeningPoint,
        });
      }
      return true;
    },
    { error: 'Compliance check failed' }
  );
}
