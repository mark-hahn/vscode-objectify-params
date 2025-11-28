import { vi } from 'vitest';

vi.mock('vscode', () => {
  const outputChannel = {
    appendLine: () => undefined,
  };

  return {
    window: {
      createOutputChannel: () => outputChannel,
      showInformationMessage: vi.fn(),
      showWarningMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      activeTextEditor: undefined,
      visibleTextEditors: [],
    },
    workspace: {
      getConfiguration: () => ({ get: () => undefined }),
      workspaceFolders: [],
    },
    Uri: {
      file: (path: string) => ({ fsPath: path, path }),
    },
    Selection: class {},
    Position: class {},
    Range: class {},
  };
});
