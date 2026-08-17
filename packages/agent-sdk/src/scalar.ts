import { agentScalar } from '@scalar/agent';

export function createScalarInstallation() {
  const token = process.env.SCALAR_PERSONAL_ACCESS_TOKEN;
  const installationId = process.env.SCALAR_INSTALLATION_ID;
  if (!token || !installationId) {
    throw new Error('SCALAR_PERSONAL_ACCESS_TOKEN and SCALAR_INSTALLATION_ID are required');
  }
  const scalar = agentScalar({ token });
  return scalar.installation(installationId);
}

export async function createScalarVercelAITools() {
  const installation = await createScalarInstallation();
  return installation.createVercelAITools();
}

export function createScalarOpenAIMCP() {
  return createScalarInstallation().then((installation) => installation.createOpenAIMCP());
}

export function createScalarAnthropicMCP() {
  return createScalarInstallation().then((installation) => installation.createAnthropicMCP());
}
