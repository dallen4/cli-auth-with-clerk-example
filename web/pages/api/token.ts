import type { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

type CreateSignInTokenSuccess = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSignInTokenSuccess | string>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { userId } = getAuth(req);

  if (!userId) return res.status(401).send('Unauthorized');

  const client = await clerkClient();

  const { token } = await client.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 20,
  });

  return res.status(200).json({ token });
}
