import { readFile, access } from "node:fs/promises";
import ts from "typescript";

// Use the project's existing TypeScript dependency; no extra test packages or builds.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith(".")) throw error;
    for (const extension of [".ts", ".tsx"]) {
      const url = new URL(specifier + extension, context.parentURL);
      try { await access(url); } catch { continue; }
      return { url: url.href, shortCircuit: true };
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (!/\.tsx?$/.test(url)) return nextLoad(url, context);
  let source = await readFile(new URL(url), "utf8");
  // Vite normally supplies this value. Tests use a dummy URL and a fake adapter,
  // never development configuration, network requests or a different Axios client.
  if (url.endsWith("/src/lib/api.ts")) {
    source = source.replace("import.meta.env.VITE_API_URL", '"http://frontend-test.invalid/api/v1"');
  }
  const result = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
    verbatimModuleSyntax: true,
  } });
  return { format: "module", source: result.outputText, shortCircuit: true };
}
