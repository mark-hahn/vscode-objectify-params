import * as vscode from 'vscode';
import * as path from 'path';
import { Minimatch } from 'minimatch';

const outputChannel = vscode.window.createOutputChannel('Objectify Params');

export interface WorkspaceContext {
  editor: vscode.TextEditor;
  workspaceRoot: string;
  filePath: string;
}

const minimatchOptions = {
  dot: true,
  nocase: process.platform === 'win32',
};

export function getWorkspaceContext(): WorkspaceContext | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showErrorMessage('No editor file open.');
    return null;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    void vscode.window.showErrorMessage('No workspace folder open.');
    return null;
  }

  const filePath = editor.document.fileName;
  const containingFolder = vscode.workspace.getWorkspaceFolder(
    editor.document.uri
  );
  const workspaceRoot = containingFolder
    ? containingFolder.uri.fsPath
    : workspaceFolders[0].uri.fsPath;

  return { editor, workspaceRoot, filePath };
}

function toGlobPath(p?: string): string | undefined {
  if (!p) return undefined;
  return p.replace(/\\/g, '/');
}

export function isFileIncludedByConfig(
  filePath: string,
  workspaceRoot: string
): { included: boolean; includeGlobs: string; excludeGlobs: string } {
  const cfg = vscode.workspace.getConfiguration('objectifyParams');
  const includeGlobs = (cfg.get('include') as string) || '**/*.ts **/*.js';
  const excludeGlobs = (cfg.get('exclude') as string) || '**/node_modules/**';
  const includePatterns = includeGlobs.split(/\s+/).filter(Boolean);
  const excludePatterns = excludeGlobs.split(/\s+/).filter(Boolean);

  const result = {
    included: false,
    includeGlobs,
    excludeGlobs,
  };

  if (!includePatterns.length) {
    return result;
  }

  const candidates: string[] = [];
  const absoluteCandidate = toGlobPath(path.resolve(filePath));
  if (absoluteCandidate) {
    candidates.push(absoluteCandidate);
  }

  const relativePath = path.relative(workspaceRoot, filePath);
  if (relativePath && !relativePath.startsWith('..')) {
    const relCandidate = toGlobPath(relativePath);
    if (relCandidate) {
      candidates.push(relCandidate);
    }
  }

  if (!candidates.length) {
    return result;
  }

  const matchesInclude = includePatterns.some((pattern) => {
    const matcher = new Minimatch(pattern, minimatchOptions);
    return candidates.some((candidate) => matcher.match(candidate));
  });

  if (!matchesInclude) {
    return result;
  }

  const matchesExclude = excludePatterns.length
    ? excludePatterns.some((pattern) => {
        const matcher = new Minimatch(pattern, minimatchOptions);
        return candidates.some((candidate) => matcher.match(candidate));
      })
    : false;

  return {
    included: !matchesExclude,
    includeGlobs,
    excludeGlobs,
  };
}

export function getLog(module: string): {
  log: (...args: any[]) => void;
  start: (name: string, hide?: boolean, msg?: string) => void;
  end: (name: string, onlySlow?: boolean, msg?: string) => void;
} {
  const timers: Record<string, number> = {};

  const start = function (name: string, hide = false, msg = ''): void {
    const startTime = Date.now();
    timers[name] = startTime;
    if (hide) return;
    const line = `[objpar:${module}] ${name} started${msg ? ', ' + msg : ''}`;
    outputChannel.appendLine(line);
    console.log(line);
  };

  const end = function (name: string, onlySlow = false, msg = ''): void {
    if (!timers[name]) {
      const line = `[objpar:${module}] ${name} ended${msg ? ', ' + msg : ''}`;
      outputChannel.appendLine(line);
      console.log(line);
      return;
    }
    const endTime = Date.now();
    const duration = endTime - timers[name];
    if (onlySlow && duration < 100) return;
    const line = `[objpar:${module}] ${name} ended, ${duration}ms${
      msg ? ', ' + msg : ''
    }`;
    outputChannel.appendLine(line);
    console.log(line);
  };

  const log = function (...args: any[]): void {
    let errFlag = false;
    let errMsgFlag = false;
    let infoFlag = false;
    let nomodFlag = false;

    if (typeof args[0] === 'string') {
      errFlag = args[0].includes('err');
      infoFlag = args[0].includes('info');
      nomodFlag = args[0].includes('nomod');
      errMsgFlag = args[0].includes('errmsg');
    }

    if (errFlag || infoFlag || nomodFlag || errMsgFlag) args = args.slice(1);

    let errMsg: string | undefined;
    if (errMsgFlag) {
      errMsg = args[0]?.message + ' -> ';
      args = args.slice(1);
      errFlag = true;
    }

    const par = args.map((a) => {
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a, null, 2);
        } catch (e: any) {
          return JSON.stringify(Object.keys(a)) + e.message;
        }
      } else return a;
    });

    const line =
      (nomodFlag ? '' : '[objpar:' + module + '] ') +
      (errFlag ? ' error, ' : '') +
      (errMsg !== undefined ? errMsg : '') +
      par.join(' ');

    const infoLine = par.join('Objectify Params: ').replace('parse: ', '');

    outputChannel.appendLine(line);
    if (errFlag) console.error(line);
    else console.log(line);
    if (infoFlag) void vscode.window.showInformationMessage(infoLine);
  };

  return { log, start, end };
}
