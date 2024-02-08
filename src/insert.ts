/**
 * Official documentation for the `INSERT` statement:
 * https://dev.mysql.com/doc/refman/8.0/en/insert.html
 *
 * The exact syntax of the `INSERT` statement is not needed to infer the return type, because it
 * seems like the returned value is always a string.
 *
 * For the sake of completeness, here is the syntax of the `INSERT` statement:
 *
 * ```
 * INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
 *     [INTO] tbl_name
 *     [PARTITION (partition_name [, partition_name] ...)]
 *     [(col_name [, col_name] ...)]
 *     { {VALUES | VALUE} (value_list) [, (value_list)] ... }
 *     [AS row_alias[(col_alias [, col_alias] ...)]]
 *     [ON DUPLICATE KEY UPDATE assignment_list]
 *
 * INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
 *     [INTO] tbl_name
 *     [PARTITION (partition_name [, partition_name] ...)]
 *     SET assignment_list
 *     [AS row_alias[(col_alias [, col_alias] ...)]]
 *     [ON DUPLICATE KEY UPDATE assignment_list]
 *
 * INSERT [LOW_PRIORITY | HIGH_PRIORITY] [IGNORE]
 *     [INTO] tbl_name
 *     [PARTITION (partition_name [, partition_name] ...)]
 *     [(col_name [, col_name] ...)]
 *     { SELECT ...
 *       | TABLE table_name
 *       | VALUES row_constructor_list
 *     }
 *     [ON DUPLICATE KEY UPDATE assignment_list]
 *
 * value:
 *     {expr | DEFAULT}
 *
 * value_list:
 *     value [, value] ...
 *
 * row_constructor_list:
 *     ROW(value_list)[, ROW(value_list)][, ...]
 *
 * assignment:
 *     col_name =
 *           value
 *         | [row_alias.]col_name
 *         | [tbl_name.]col_name
 *         | [row_alias.]col_alias
 *
 * assignment_list:
 *     assignment [, assignment] ...
 * ```
 *
 *
 * Not supported:
 * - currently only first form is supported
 * - PARTITION
 * - alias
 * - ON DUPLICATE KEY UPDATE
 */

import { ExpandRecursively, FilterOut, Slice, SliceFromFirstNonMatch, TODO, Tokenize } from "./utils";

export type IsInsertStatement<Query extends string> = Query extends `INSERT ${string}` ? true : false;

export type ReturnTypeFromInsertStatement = string;

type ParseTableName<tokens extends string[]> = SliceFromFirstNonMatch<
  tokens,
  "INSERT" | "LOW_PRIORITY" | "DELAYED" | "HIGH_PRIORITY" | "IGNORE" | "INTO"
>[0];
type ParseColumns<tokens extends string[]> = FilterOut<Slice<tokens, "(", "VALUES" | "VALUE">, "(" | ")">;
type ParseValues<tokens extends string[]> = FilterOut<Slice<tokens, "VALUES" | "VALUE", "AS" | "ON">, "(" | ")">;

type GetParamColumns<
  Columns extends string[],
  Values extends string[],
  ParamColumns extends string[] = [],
> = Values extends [infer FirstValue extends string, ...infer RestValues extends string[]]
  ? Columns extends [infer FirstColumn extends string, ...infer RestColumns extends string[]]
    ? FirstValue extends "?"
      ? GetParamColumns<RestColumns, RestValues, [...ParamColumns, FirstColumn]>
      : GetParamColumns<RestColumns, RestValues, ParamColumns>
    : ParamColumns
  : ParamColumns;

/**
 * Returns the AST of the tokenized `INSERT` statement
 */
type InsertParser<tokens extends string[]> = {
  into: ParseTableName<tokens>;
  columns: ParseColumns<tokens>;
  values: ParseValues<tokens>;
  paramColumns: GetParamColumns<ParseColumns<tokens>, ParseValues<tokens>>;
};

type GetAst<Query extends string> = InsertParser<Tokenize<Query>>;

type InferParamsType<Table extends string, ParamColumns extends string[], Tables> = Table extends keyof Tables
  ? ParamColumns extends [infer First, ...infer Rest extends string[]]
    ? First extends keyof Tables[Table]
      ? [Tables[Table][First], ...InferParamsType<Table, Rest, Tables>]
      : [never, ...InferParamsType<Table, Rest, Tables>]
    : []
  : [];

export type ParseInsertStatement<Query extends string, Tables extends TODO> = ExpandRecursively<
  InferParamsType<GetAst<Query>["into"], GetAst<Query>["paramColumns"], Tables>
>;
