declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): Statement
    exec(sql: string): this
    close(): void
  }

  interface Statement {
    run(...params: unknown[]): RunResult
    get(...params: unknown[]): unknown
    all(...params: unknown[]): unknown[]
  }

  interface RunResult {
    changes: number
    lastInsertRowid: number | bigint
  }

  function Database(filename: string, options?: unknown): Database
  export = Database
}
