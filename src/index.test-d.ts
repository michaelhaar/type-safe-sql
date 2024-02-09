import { test, describe, expectTypeOf } from "vitest";
import { InferParamsTypeFromSqlStatement, InferReturnTypeFromSqlStatement } from "./index";

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

function inferReturnTypeFromSqlStatement<Query extends string>(
  query: Query,
): InferReturnTypeFromSqlStatement<Query, TestTables> {
  return query as any;
}

function inferParamsTypeFromSqlStatement<Query extends string>(
  query: Query,
): InferParamsTypeFromSqlStatement<Query, TestTables> {
  return query as any;
}

describe("SELECT", () => {
  test("SELECT * FROM users", () => {
    const result = inferReturnTypeFromSqlStatement("SELECT * FROM users");
    expectTypeOf(result).toEqualTypeOf<{ id: number; name: string }[]>();
  });

  test("SELECT id, name AS fullName FROM users", () => {
    const result = inferReturnTypeFromSqlStatement("SELECT id, name AS fullName FROM users");
    expectTypeOf(result).toEqualTypeOf<{ id: number; fullName: string }[]>();
  });

  test("SELECT id, name AS fullName FROM users WHERE id = 1 ORDER BY name", () => {
    const result = inferReturnTypeFromSqlStatement("SELECT id, name AS fullName FROM users WHERE id = 1 ORDER BY name");
    expectTypeOf(result).toEqualTypeOf<{ id: number; fullName: string }[]>();
  });

  test("SELECT id, name, posts.title FROM users JOIN posts ON users.id = posts.userId", () => {
    const result = inferReturnTypeFromSqlStatement(
      "SELECT id, name, posts.title FROM users JOIN posts ON users.id = posts.userId",
    );
    expectTypeOf(result).toEqualTypeOf<{ id: number; name: string; title: string }[]>();
  });
});

describe("DELETE", () => {
  test("DELETE FROM users", () => {
    const result = inferReturnTypeFromSqlStatement("DELETE FROM users");
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  test("DELETE FROM users WHERE id = ? AND name = ?", () => {
    const result = inferParamsTypeFromSqlStatement("DELETE FROM users WHERE id = ? AND name = ?");
    expectTypeOf(result).toEqualTypeOf<[number, string]>();
  });
});

describe("INSERT", () => {
  describe("inferReturnType", () => {
    test("INSERT INTO users (id, name) VALUES (1, 'Alice')", () => {
      const result = inferReturnTypeFromSqlStatement("INSERT INTO users (id, name) VALUES (1, 'Alice')");
      expectTypeOf(result).toEqualTypeOf<string>();
    });
  });

  // TODO: Uncomment this test on next vitest release
  // describe("inferParamsType", () => {
  test("INSERT INTO users (id, name) VALUES (?, ?)", () => {
    const result = inferParamsTypeFromSqlStatement("INSERT INTO users (id, name) VALUES (?, ?)");
    expectTypeOf(result).toEqualTypeOf<[number, string]>();
  });
  // });
});

describe("UPDATE", () => {
  test("UPDATE users SET name = 'Bob' WHERE id = 1", () => {
    const result = inferReturnTypeFromSqlStatement("UPDATE users SET name = 'Bob' WHERE id = 1");
    expectTypeOf(result).toEqualTypeOf<string>();
  });
});
