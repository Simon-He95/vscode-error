import * as vscode from 'vscode'

export function activate(context: any) {
  const statusBarItem = vscode.window.createStatusBarItem(1, 200)
  const level: Record<number, string> = {
    1: '😳',
    2: '😦',
    3: '😰',
    4: '😵',
    5: '💀',
  }
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (e) => {
      const { languageId } = e.document
      if (languageId === 'javascript' || languageId === 'typescript') {
        const errors = await checkForErrors(e.document)
        const errLen = errors.length
        if (errLen > 0) {
          statusBarItem.text = `${level[errLen]} ${errLen} Error(s)`
          statusBarItem.tooltip = `❌ Syntax Errors:\n${errors.map((error, i) => `${i}. ${error.message} 👉 Line:${error.range.c.c}:${error.range.c.e};`).join('\n')}`
          statusBarItem.show()
        }
        else {
          statusBarItem.hide()
        }
      }
    }),
  )
}

export function deactivate() {

}

async function checkForErrors(doc: vscode.TextDocument) {
  return filterSameErrors(await vscode.languages.getDiagnostics(doc.uri))
    .filter(d =>
      d.severity === vscode.DiagnosticSeverity.Error && /(ts)|(js)/.test(d.source ?? ''))
}

function filterSameErrors(array: any[]) {
  const result: any[] = []
  array.forEach((item) => {
    if (result.some((_item) => {
      const { c: { c: pre_cc, e: pre_ce }, e: { c: pre_ec, e: pre_ee } } = _item.range
      const { c: { c: cur_cc, e: cur_ce }, e: { c: cur_ec, e: cur_ee } } = item.range
      return pre_cc === cur_cc && pre_ce === cur_ce && pre_ec === cur_ec && pre_ee === cur_ee
    }))
      return
    result.push(item)
  })

  return result
}
