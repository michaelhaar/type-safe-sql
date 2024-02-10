import { test, describe, expectTypeOf } from "vitest";
import type {
  GetSelectExpressions,
  GetTableNames,
  InferParamsTypeFromSelectStatement,
  InferReturnTypeFromSelectStatement,
  ParseSelectStatement,
} from "./select";

describe("ParseSelectStatement", () => {
  function parseSelectStatement<Query extends string>(query: Query): ParseSelectStatement<Query> {
    return query as any;
  }

  test("SELECT * FROM tbl_name", () => {
    const selectStatement = parseSelectStatement("SELECT * FROM tbl_name");
    expectTypeOf(selectStatement).toEqualTypeOf<{ selectExpressionsString: "*"; tableReferencesString: "tbl_name" }>();
  });

  test("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2", () => {
    const selectStatement = parseSelectStatement("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2");
    expectTypeOf(selectStatement).toEqualTypeOf<{
      selectExpressionsString: "col1, col2";
      tableReferencesString: "tbl_name1 JOIN tbl_name2";
    }>();
  });
});

describe("GetSelectExpressions", () => {
  function getSelectExpressions<Query extends string>(query: Query): GetSelectExpressions<Query> {
    return query as any;
  }

  test("SELECT * FROM tbl_name", () => {
    const selectExpressions = getSelectExpressions("SELECT * FROM tbl_name");
    expectTypeOf(selectExpressions).toEqualTypeOf<["*"]>();
  });

  test("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2", () => {
    const selectExpressions = getSelectExpressions("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2");
    expectTypeOf(selectExpressions).toEqualTypeOf<["col1", "col2"]>();
  });
});

describe("GetTableNames", () => {
  function getTableNames<Query extends string>(query: Query): GetTableNames<Query> {
    return query as any;
  }

  test("SELECT * FROM tbl_name", () => {
    const tableNames = getTableNames("SELECT * FROM tbl_name");
    expectTypeOf(tableNames).toEqualTypeOf<["tbl_name"]>();
  });

  test("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2", () => {
    const tableNames = getTableNames("SELECT col1, col2 FROM tbl_name1 JOIN tbl_name2");
    expectTypeOf(tableNames).toEqualTypeOf<["tbl_name1", "tbl_name2"]>();
  });
});

describe("InferReturnTypeFromSelectStatement", () => {
  type TestTables = {
    users: {
      id: number;
      name: string;
    };
    posts: {
      id: number;
      title: string;
      body: string;
      userId: number;
    };
    comments: {
      id: number;
      body: string;
      postId: number;
    };
  };

  function inferReturnTypeFromSelectStatement<Query extends string>(
    query: Query,
  ): InferReturnTypeFromSelectStatement<Query, TestTables> {
    return query as any;
  }

  test("SELECT * FROM users", () => {
    const result = inferReturnTypeFromSelectStatement("SELECT * FROM users");
    expectTypeOf(result).toEqualTypeOf<TestTables["users"][]>();
  });

  test("SELECT id, name FROM users", () => {
    const result = inferReturnTypeFromSelectStatement("SELECT id, name FROM users");
    expectTypeOf(result).toEqualTypeOf<{ id: number; name: string }[]>();
  });

  test("SELECT users.id, posts.title FROM users JOIN posts", () => {
    const result = inferReturnTypeFromSelectStatement("SELECT users.id, posts.title FROM users JOIN posts");
    expectTypeOf(result).toEqualTypeOf<{ id: number; title: string }[]>();
  });

  test("SELECT id AS id_alias FROM users", () => {
    const result = inferReturnTypeFromSelectStatement("SELECT id AS id_alias FROM users");
    expectTypeOf(result).toEqualTypeOf<{ id_alias: number }[]>();
  });

  test("SELECT id id_alias FROM users", () => {
    const result = inferReturnTypeFromSelectStatement("SELECT id id_alias FROM users");
    expectTypeOf(result).toEqualTypeOf<{ id_alias: number }[]>();
  });
});

describe("InferParamsTypeFromSelectStatement", () => {
  type TestTables = {
    users: {
      id: number;
      name: string;
    };
    posts: {
      id: number;
      title: string;
      body: string;
      userId: number;
    };
    comments: {
      id: number;
      body: string;
      postId: number;
    };
  };

  function inferParamsType<Query extends string>(query: Query): InferParamsTypeFromSelectStatement<Query, TestTables> {
    return query as any;
  }

  test("SELECT * FROM users", () => {
    const result = inferParamsType("SELECT * FROM users");
    expectTypeOf(result).toEqualTypeOf<[]>();
  });

  test("SELECT * FROM users WHERE id = ? AND name = ?", () => {
    const result = inferParamsType("SELECT * FROM users WHERE id = ? AND name = ?");
    expectTypeOf(result).toEqualTypeOf<[number, string]>();
  });

  test("SELECT * FROM users JOIN posts ON users.id = posts.userId WHERE users.id = ? AND posts.title = ?", () => {
    const result = inferParamsType(
      "SELECT * FROM users JOIN posts ON users.id = posts.userId WHERE users.id = ? AND posts.title = ?",
    );
    expectTypeOf(result).toEqualTypeOf<[number, string]>();
  });
});
