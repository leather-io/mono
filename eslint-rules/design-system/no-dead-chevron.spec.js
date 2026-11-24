import { noDeadChevronRule } from './no-dead-chevron.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-dead-chevron', noDeadChevronRule, {
  valid: [
    { code: '<ContactRow contact={contact} navigates onClick={() => openContact(contact.id)} />' },
    { code: '<AssetRow name="Bitcoin" navigates onClick={openToken} />' },
    { code: '<ContactRow contact={contact} onClick={noop} />' },
    { code: '<ContactRow contact={contact} navigates={false} />' },
  ],
  invalid: [
    {
      code: '<ContactRow contact={contact} navigates />',
      errors: [
        {
          message:
            'Use navigates only with an onClick that opens a deeper view, instead of a chevron on a row that goes nowhere; drop navigates for a pick or display row — docs/design/never.md#dead-chevron',
        },
      ],
    },
    {
      code: '<AddressRow address={a} navigates onClick={noop} />',
      errors: [{ messageId: 'deadChevron' }],
    },
    {
      code: '<AddressRow address={a} navigates={true} onClick={() => undefined} />',
      errors: [{ messageId: 'deadChevron' }],
    },
    {
      code: '<AddressRow address={a} navigates onClick={() => {}} />',
      errors: [{ messageId: 'deadChevron' }],
    },
  ],
});
