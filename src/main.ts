import {CompilationUnit, SetStatement, SLParser} from "./parser";
import {getNodeDefinition, toJSON} from "@strumenta/tylasu";

console.log("Node definition for CompilationUnit", getNodeDefinition(CompilationUnit));
console.log("Node definition for SetStatement", getNodeDefinition(SetStatement));

const code = `set foo = 123
set goo = "aloha"
set sum = 5 + 10`;
console.log(`Parsing "${code}"...`);
const parser = new SLParser();
const startTime = Date.now();
const result = parser.parse(code);
const endTime = Date.now();
console.log(`Parsing took ms`);
const astJson = JSON.stringify( toJSON(result), null, 2);
console.log("Parsed into", astJson, ` in ${endTime - startTime} ms.`);
