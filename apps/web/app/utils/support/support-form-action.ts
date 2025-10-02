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
    // eslint-disable-next-line no-console
    console.error('Error submitting form:', parsedData.error);
    return;
  }

  const resp = await postFrontAppSupportMessage(parsedData.data).catch(error => {
    // fail silently
    // eslint-disable-next-line no-console
    console.error(error);
    return error;
  });

  return resp.status;
}
