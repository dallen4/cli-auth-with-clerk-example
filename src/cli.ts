import { Command } from 'commander';
import { description, version } from '../package.json';
import { createClerkClient } from './lib/clerk';
import { createLocalAuthServer } from './lib/localhostServer';
import { LOCALHOST_AUTH_URL, WEB_APP_URL } from './constants';
import open from 'open';

const myCli = new Command();

myCli.name('myCli').description(description).version(version);

myCli.command('login').action(async () => {
  const clerkClient = await createClerkClient();

  if (clerkClient.session) {
    console.info(
      `You're already signed in as ${clerkClient.session.user.emailAddresses[0]}!`,
    );

    return process.exit(0);
  }

  const { listenForAuthRedirect } = await createLocalAuthServer();

  const newUrl = new URL(WEB_APP_URL);
  newUrl.searchParams.set('redirectUrl', LOCALHOST_AUTH_URL);

  const url = encodeURI(newUrl.toString());

  console.log('Opening webpage for authentication...');

  await open(url);

  let success = false;

  try {
    console.log('Awaiting confirmation in the browser...');

    const token = await listenForAuthRedirect();

    if (token) {
      console.log('Authenticating CLI and storing credentials...');

      const res = await clerkClient.client?.signIn.create({
        strategy: 'ticket',
        ticket: token,
      });

      success = (res && res.status === 'complete') || false;
    } else throw new Error('Failed to authenticate!');
  } catch (err) {
    console.error(err);
  }

  if (success) console.info('Successfully logged in!');
  else console.error('Authentication with provided token failed!');

  process.exit(success ? 0 : 1);
});

myCli.command('logout').action(async () => {});

export { myCli };
