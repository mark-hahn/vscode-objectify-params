export const window = {
  createOutputChannel: () => ({ appendLine: () => undefined }),
  showInformationMessage: () => Promise.resolve(undefined),
  showWarningMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  activeTextEditor: undefined,
  visibleTextEditors: [],
};

export const workspace = {
  getConfiguration: () => ({ get: () => undefined }),
  openTextDocument: async () => ({
    getText: () => '',
    positionAt: () => ({ line: 0, character: 0 }),
  }),
};

export const Uri = {
  file: (fsPath: string) => ({ fsPath, path: fsPath }),
};

export class Range {
  constructor(public start: any, public end: any) {}
}

export class Position {
  constructor(public line: number, public character: number) {}
}

export class Selection {}

export const TextEditorRevealType = {
  Default: 0,
  InCenter: 1,
  AtTop: 2,
};

export default {
  window,
  workspace,
  Uri,
  Range,
  Position,
  Selection,
  TextEditorRevealType,
};
