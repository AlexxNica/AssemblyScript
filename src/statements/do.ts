import { Compiler } from "../compiler";
import { intType } from "../types";
import { binaryen } from "../wasm";
import * as wasm from "../wasm";

export function compileDo(compiler: Compiler, node: ts.DoStatement, onVariable: (node: ts.VariableDeclaration) => number): binaryen.Statement {
  const op = compiler.module;
  const statement = compiler.compileStatement(node.statement, onVariable);

  compiler.enterBreakContext();

  const label = compiler.currentBreakLabel;
  const context = op.loop("break$" + label, op.block("continue$" + label, [
    statement || op.nop(),
    op.break("break$" + label, op.i32.eqz(compiler.maybeConvertValue(node.expression, compiler.compileExpression(node.expression, intType), <wasm.Type>(<any>node.expression).wasmType, intType, true)))
  ]));

  compiler.leaveBreakContext();
  return context;
}
