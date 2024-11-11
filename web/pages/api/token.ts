import type { NextApiRequest, NextApiResponse } from 'next';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

type CreateSignInTokenSuccess = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSignInTokenSuccess>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { userId } = await auth();

  if (!userId)
    return new NextResponse('Unauthorized', { status: 401 });

  const client = await clerkClient();

  const { token } = await client.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 20,
  });

  return NextResponse.json<CreateSignInTokenSuccess>(
    { token },
    { status: 200 },
  );
}
