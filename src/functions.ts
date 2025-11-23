import * as vscode from 'vscode';
import { SyntaxKind } from 'ts-morph';
import * as utils from './utils';
import * as parse from './parse';

const { log } = utils.getLog('fnct');

export function checkFunctionsCommandHandler(): void {
  const context = utils.getWorkspaceContext();
  if (!context) return;

  const { editor, workspaceRoot, filePath } = context;
  log('activeFile:', filePath);
  log('chosen workspaceRoot:', workspaceRoot);

  void (async () => {
    try {
      const project = await parse.createProjectFromConfig(workspaceRoot);

      let sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) {
        sourceFile = project.createSourceFile(filePath, editor.document.getText(), { overwrite: true });
      }

      const results: any = { works: [], notWorks: [] };
      const toCheck = parse.findFunctionsInFile(sourceFile);

      for (const item of toCheck) {
        const fn = item.node;
        const name = item.name || '<anonymous>';
        const params = fn.getParameters ? fn.getParameters() : [];
        if (!params || params.length === 0) continue;

        const resolvedFuncSym = parse.resolveSymbol(fn);

        let ambiguous = false;
        let anyCalls = false;

        const files = project.getSourceFiles();
        for (const sf of files) {
          const calls = sf.getDescendantsOfKind(SyntaxKind.CallExpression);
          for (const call of calls) {
            const expr = call.getExpression();
            if (!expr) continue;
            const exprText = expr.getText();
            if (name === '<anonymous>') continue;
            if (!(exprText === name || exprText.endsWith('.' + name) || exprText.endsWith('[' + name + ']'))) continue;
            anyCalls = true;

            const resolvedCalled = parse.resolveSymbol(expr);
            if (!resolvedFuncSym) { ambiguous = true; break; }
            if (!resolvedCalled) { ambiguous = true; break; }

            try {
              const fnName = parse.getSymbolName(resolvedFuncSym);
              const callName = parse.getSymbolName(resolvedCalled);
              if (fnName !== callName) { ambiguous = true; break; }
            } catch (e) { ambiguous = true; break; }
          }
          if (ambiguous) break;
        }

        if (ambiguous) results.notWorks.push({ name, reason: anyCalls ? 'Ambiguous or unresolved calls found' : 'Function symbol unresolved' });
        else results.works.push({ name, note: anyCalls ? 'All matching calls resolved' : 'No matching calls found' });
      }

      log('Params-to-Object check results for', filePath);
      log('Works:');
      for (const w of results.works) log('  -', w.name, '-', w.note);
      log('Not reliable:');
      for (const n of results.notWorks) log('  -', n.name, '-', n.reason);

      void vscode.window.showInformationMessage('Checked functions — see developer console for details.');
    } catch (err: any) {
      console.error(err);
      void vscode.window.showErrorMessage('An error occurred during check: ' + (err.message || err));
    }
  })();
}
