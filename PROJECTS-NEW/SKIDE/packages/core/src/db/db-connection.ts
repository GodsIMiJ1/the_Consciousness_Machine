import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

export class DatabaseConnection {
  private db: Database.Database | null = null
  private dbPath: string

  constructor(dbPath: string = './data/skide.db') {
    this.dbPath = dbPath
  }

  async connect(): Promise<boolean> {
    try {
      // Create database connection
      this.db = new Database(this.dbPath)
      
      // Configure database
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('foreign_keys = ON')
      this.db.pragma('temp_store = memory')
      this.db.pragma('mmap_size = 268435456') // 256MB
      this.db.pragma('cache_size = 10000')
      
      // Initialize schema
      await this.initializeSchema()
      
      console.log(`Connected to SQLite database at ${this.dbPath}`)
      return true
    } catch (error) {
      console.error('Failed to connect to database:', error)
      return false
    }
  }

  private async initializeSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not connected')

    try {
      // Read schema file
      const schemaPath = join(__dirname, 'schema.sql')
      const schema = readFileSync(schemaPath, 'utf-8')
      
      // Execute schema
      this.db.exec(schema)
      
      console.log('Database schema initialized successfully')
    } catch (error) {
      console.error('Failed to initialize schema:', error)
      throw error
    }
  }

  disconnect(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('Disconnected from database')
    }
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db
  }

  // Transaction helpers
  transaction<T>(fn: () => T): T {
    const db = this.getDatabase()
    const transaction = db.transaction(fn)
    return transaction()
  }

  // Prepared statement helpers
  prepare(sql: string): Database.Statement {
    const db = this.getDatabase()
    return db.prepare(sql)
  }

  // Common operations
  async query(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.getDatabase()
    const stmt = db.prepare(sql)
    return stmt.all(...params)
  }

  async queryOne(sql: string, params: any[] = []): Promise<any | null> {
    const db = this.getDatabase()
    const stmt = db.prepare(sql)
    return stmt.get(...params) || null
  }

  async execute(sql: string, params: any[] = []): Promise<Database.RunResult> {
    const db = this.getDatabase()
    const stmt = db.prepare(sql)
    return stmt.run(...params)
  }

  // Batch operations
  async insertMany(sql: string, records: any[][]): Promise<void> {
    const db = this.getDatabase()
    const stmt = db.prepare(sql)
    const transaction = db.transaction(() => {
      for (const record of records) {
        stmt.run(...record)
      }
    })
    transaction()
  }

  // Utility methods
  async getTableInfo(tableName: string): Promise<any[]> {
    return this.query(`PRAGMA table_info(${tableName})`)
  }

  async getTableList(): Promise<string[]> {
    const tables = await this.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    return tables.map(table => table.name)
  }

  async vacuum(): Promise<void> {
    const db = this.getDatabase()
    db.exec('VACUUM')
    console.log('Database vacuumed successfully')
  }

  async analyze(): Promise<void> {
    const db = this.getDatabase()
    db.exec('ANALYZE')
    console.log('Database statistics updated')
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.queryOne('SELECT 1 as test')
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  // Backup
  async backup(backupPath: string): Promise<boolean> {
    try {
      const db = this.getDatabase()
      const backup = new Database(backupPath)
      await new Promise<void>((resolve, reject) => {
        db.backup(backup)
          .then(() => {
            backup.close()
            resolve()
          })
          .catch(reject)
      })
      console.log(`Database backed up to ${backupPath}`)
      return true
    } catch (error) {
      console.error('Database backup failed:', error)
      return false
    }
  }
}

// Singleton instance
let dbConnection: DatabaseConnection | null = null

export function getDbConnection(dbPath?: string): DatabaseConnection {
  if (!dbConnection) {
    dbConnection = new DatabaseConnection(dbPath)
  }
  return dbConnection
}

export function closeDbConnection(): void {
  if (dbConnection) {
    dbConnection.disconnect()
    dbConnection = null
  }
}