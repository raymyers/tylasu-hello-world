import {ASTNode, Child, Children, Issue, Node, Attribute} from "@strumenta/tylasu";
import {ASTTransformer} from "@strumenta/tylasu";
import {SimpleLangLexer} from "./parser/SimpleLangLexer";
import {Lexer} from "antlr4ng";
import {CharStream} from "antlr4ng";
import {
    BinaryExprContext,
    CompilationUnitContext,
    LiteralExprContext,
    SetStmtContext,
    SimpleLangParser
} from "./parser/SimpleLangParser";
import {TokenStream, CommonTokenStream} from "antlr4ng";

@ASTNode("", "CompilationUnit")
export class CompilationUnit extends Node {
    @Children()
    statements: Statement[];
}

export abstract class Statement extends Node {}

@ASTNode("", "SetStatement")
export class SetStatement extends Statement {
    @Attribute() variable: string;
    @Child() expression: Expression;

    constructor(variable: string) {
        super();
        this.variable = variable;
    }
}

export enum Type {
    IntegerType = "IntegerType",
    DecimalType = "DecimalType",
    StringType = "StringType",
    BooleanType = "BooleanType"
}

export abstract class Operator {}
export abstract class BinaryOperator extends Operator {}
export class SumOperator extends BinaryOperator {}
export class SubtractionOperator extends BinaryOperator {}
export class MultiplicationOperator extends BinaryOperator {}
export class DivisionOperator extends BinaryOperator {}

export abstract class Expression extends Node {
    @Attribute() type: Type;
}
@ASTNode("", "LiteralExpression")
export class LiteralExpression extends Expression {
    @Attribute() value: string;

    constructor(value: string, type: Type) {
        super();
        this.value = value;
        this.type = type;
    }
}
@ASTNode("", "BinaryExpression")
export class BinaryExpression extends Expression {
    @Attribute() operator: BinaryOperator;
    @Child() left: Expression;
    @Child() right: Expression;

    constructor(operator: BinaryOperator) {
        super();
        this.operator = operator;
    }
}
const transformer = new ASTTransformer()

transformer.registerNodeFactory(CompilationUnitContext, () => {
    return new CompilationUnit();
})
.withChild({ source: "statement", target: "statements" });

transformer.registerNodeFactory(SetStmtContext, (setStmt: SetStmtContext) => {
    return new SetStatement(setStmt.ID().getText());
})
.withChild({ source: "expression", target: "expression" });

transformer.registerNodeFactory(LiteralExprContext, (literalExpression: LiteralExprContext) => {
    let type;

    if (literalExpression.INT_LIT() != null) type = Type.IntegerType;
    else if (literalExpression.DEC_LIT() != null) type = Type.DecimalType;
    else if (literalExpression.STRING_LIT() != null) type = Type.StringType;
    else if (literalExpression.BOOLEAN_LIT() != null) type = Type.BooleanType;

    return new LiteralExpression(literalExpression.getText(), type);
});

transformer.registerNodeFactory(BinaryExprContext, (binaryExpression: BinaryExprContext) => {
    let operator;

    if (binaryExpression.PLUS() != null) operator = new SumOperator();
    else if (binaryExpression.MINUS() != null) operator = new SubtractionOperator();
    else if (binaryExpression.MULT() != null) operator = new MultiplicationOperator();
    else if (binaryExpression.DIV() != null) operator = new DivisionOperator();

    return new BinaryExpression(operator);
})
.withChild({ source: "_left", target: "left" })
.withChild({ source: "_right", target: "right" });

export class SLParser {
    createANTLRLexer(inputStream: CharStream): Lexer {
        return new SimpleLangLexer(inputStream);
    }

    createANTLRParser(tokenStream: TokenStream): SimpleLangParser {
        return new SimpleLangParser(tokenStream);
    }
    parse(text: string) {
        const lexer = this.createANTLRLexer(CharStream.fromString(text))
        const tokens = new CommonTokenStream(lexer);
        const parser = this.createANTLRParser(tokens);
        return this.parseTreeToAst(parser.compilationUnit())
    }
    parseTreeToAst(
        parseTreeRoot: CompilationUnitContext/*, considerPosition: boolean, issues: Issue[]*/
    ): Node {
        return transformer.transform(parseTreeRoot)
    }
}
