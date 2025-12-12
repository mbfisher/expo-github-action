import { isDebug } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { which } from '@actions/io';
import { ExpoConfig } from '@expo/config';

/**
 * Load the Expo app project config in the given directory.
 * This runs `expo config` command instead of using `@expo/config` directly,
 * to use the app's own version of the config.
 */
export async function loadProjectConfig(
  cwd: string,
  easEnvironment: string | null
): Promise<ExpoConfig> {
  const baseArguments = ['expo', 'config', '--json', '--type', 'public'];

  let commandLine: string;
  let args: string[];
  if (easEnvironment) {
    commandLine = await which('eas', true);
    const commandToExecute = ['npx', ...baseArguments].join(' ').replace(/"/g, '\\"');
    args = ['env:exec', '--non-interactive', easEnvironment, `"${commandToExecute}"`];
  } else {
    commandLine = 'npx';
    args = baseArguments;
  }

  const { exitCode, stdout, stderr } = await getExecOutput(commandLine, args, {
    cwd,
    ignoreReturnCode: true,
  });

  if (exitCode > 0) {
    console.log('stdout', stdout);
    console.error('stderr', stderr);
    throw new Error(`Could not fetch the project info from ${cwd}`);
  }

  return JSON.parse(stdout);
}
