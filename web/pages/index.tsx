import { useRouter } from 'next/router';
import { SignedIn, SignedOut, SignIn, useClerk } from '@clerk/nextjs';

export default function Home() {
  const clerk = useClerk();
  const router = useRouter();
  const { redirectUrl } = router.query;

  const getTokenAndRedirect = async () => {
    const sessionToken = await clerk.session!.getToken();

    if (!sessionToken) {
      alert('Tried to authenticate CLI without a session!');
      return;
    }

    const apiUrl = new URL(process.env.NEXT_PUBLIC_DEADROP_API_URL!);
    apiUrl.pathname = '/auth/token';

    const res = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });

    const payload = await res.json();

    if (typeof redirectUrl === 'string') {
      const localhostRedirect = new URL(redirectUrl);
      localhostRedirect.searchParams.set('token', payload.token);

      window.location.href = localhostRedirect.href;
    }
  };

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <SignedOut>
        <SignIn
          routing={'hash'}
          forceRedirectUrl={`/auth/cli?redirectUrl=${redirectUrl}`}
        />
      </SignedOut>
      <SignedIn>
        <h1>myCLI Authentication</h1>
        <p>Do you want to authorize the CLI on this computer?</p>
        <p>You will be redirected to a local webpage.</p>
        <button onClick={getTokenAndRedirect}>Yes, sign me in</button>
      </SignedIn>
    </div>
  );
}
