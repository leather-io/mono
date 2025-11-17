import {
  frontSupportMessageSchema,
  postFrontAppSupportMessage,
} from '~/utils/support/front-app-integration';

export async function handleSupportFormAction(request: Request) {
  const form = await request.formData();

  const payload = {
    name: form.getAll('name')[0],
    email: form.getAll('email')[0],
    subject: form.getAll('subject')[0],
    body: form.getAll('body')[0],
  };

  const parsedData = frontSupportMessageSchema.safeParse(payload);

  if (!parsedData.success) {
    return { success: false, error: 'Validation failed' };
  }

  const resp = await postFrontAppSupportMessage(parsedData.data).catch(() => {
    return null;
  });

  if (!resp) {
    return { success: false, error: 'Failed to send message' };
  }

  return { success: true, status: resp.status };
}
