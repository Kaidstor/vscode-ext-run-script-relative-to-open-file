import * as vscode from 'vscode';

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.runScriptOnOpenFile', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('Нет открытого файла.');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    const scriptPath = '~/.vscode/scripts/types.mjs';

    try {
        // Запускаем скрипт
        const { stdout, stderr } = await execPromise(
            `node ${scriptPath} "${filePath}"`
        );

        if (stderr) {
            vscode.window.showErrorMessage(`Ошибка скрипта: ${stderr}`);
            return;
        }

        // Обновляем содержимое файла
        const updatedDocument = await vscode.workspace.openTextDocument(filePath);
        const updatedText = updatedDocument.getText();

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
        );

        edit.replace(editor.document.uri, fullRange, updatedText);
        await vscode.workspace.applyEdit(edit);

        vscode.window.showInformationMessage('Файл обновлен!');
    } catch (error) {
        vscode.window.showErrorMessage(
            `Ошибка выполнения скрипта: ${(error as Error).message}`
        );
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}