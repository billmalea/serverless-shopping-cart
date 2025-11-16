import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import * as fs from 'fs';
import * as path from 'path';

// Usage: CART_USER_POOL_ID=<poolId> CART_USER_POOL_CLIENT_ID=<clientId> node -r ts-node/register scripts/create-test-user.ts

async function main() {
  const poolId = process.env.CART_USER_POOL_ID;
  const clientId = process.env.CART_USER_POOL_CLIENT_ID;
  if (!poolId || !clientId) {
    console.error('CART_USER_POOL_ID and CART_USER_POOL_CLIENT_ID must be set');
    process.exit(1);
  }

  const username = `testuser_${Date.now()}`;
  const password = 'TempPassw0rd!';

  const client = new CognitoIdentityProviderClient({});

  try {
    // Create user (admin)
    await client.send(new AdminCreateUserCommand({
      UserPoolId: poolId,
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: `${username}@example.com` },
      ],
      MessageAction: 'SUPPRESS',
    }));

    // Set permanent password so we can authenticate
    await client.send(new AdminSetUserPasswordCommand({
      UserPoolId: poolId,
      Username: username,
      Password: password,
      Permanent: true,
    }));

    // Authenticate to get tokens
    const resp = await client.send(new AdminInitiateAuthCommand({
      UserPoolId: poolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: { USERNAME: username, PASSWORD: password },
    } as any));

    const idToken = resp.AuthenticationResult?.IdToken ?? '';
    const accessToken = resp.AuthenticationResult?.AccessToken ?? '';
    const refreshToken = resp.AuthenticationResult?.RefreshToken ?? '';

    console.log('Created test user:', username);
    console.log('ID Token:', idToken);
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    // Persist values to .env.cognito for easy loading in subsequent commands
    const envFile = path.join(process.cwd(), '.env.cognito');
    const envContent = [
      `CART_USER_POOL_ID=${poolId}`,
      `CART_USER_POOL_CLIENT_ID=${clientId}`,
      `CART_TEST_USERNAME=${username}`,
      `CART_ID_TOKEN=${idToken}`,
      `CART_ACCESS_TOKEN=${accessToken}`,
      `CART_REFRESH_TOKEN=${refreshToken}`,
    ].join('\n');

    fs.writeFileSync(envFile, envContent, { encoding: 'utf8' });
    console.log(`Wrote tokens and values to ${envFile}`);
    console.log('To load into PowerShell session run:');
    console.log(`  .\\scripts\\load-cognito-env.ps1`);
  } catch (err) {
    console.error('Error creating test user', err);
    process.exit(1);
  }
}

main();
