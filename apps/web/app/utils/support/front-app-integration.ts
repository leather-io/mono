import axios from 'axios';
import z from 'zod';
import { FRONT_INBOX_ID } from '~/constants/constants';

export const frontSupportMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  body: z.string().min(40, 'Message must be at least 40 characters'),
});

export type FrontSupportMessageData = z.infer<typeof frontSupportMessageSchema>;

export async function postFrontAppSupportMessage(data: FrontSupportMessageData) {
  return axios.post(
    `https://api2.frontapp.com/inboxes/${FRONT_INBOX_ID}/imported_messages`,
    {
      sender: { handle: data.email, name: data.name },
      subject: data.subject,
      body: data.body,
      to: ['support@leather.io'],
      external_id: `leather-web-support-${data.subject}`,
      created_at: Math.floor(Date.now() / 1000),
      metadata: {
        is_inbound: true,
        is_archived: false,
        should_skip_rules: false,
      },
    },
    {
      headers: { Authorization: `Bearer ${import.meta.env.LEATHER_FRONT_WEB_APP_API_TOKEN}` },
    }
  );
}
