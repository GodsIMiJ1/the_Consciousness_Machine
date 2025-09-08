-- SKIDE Core Database Schema
-- SQLite schema for local Project Brain storage

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    last_indexed_at INTEGER,
    total_files INTEGER DEFAULT 0,
    total_lines INTEGER DEFAULT 0
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    absolute_path TEXT NOT NULL,
    language TEXT,
    content TEXT,
    content_hash TEXT,
    size_bytes INTEGER,
    line_count INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    last_modified INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, relative_path)
);

-- Embeddings table (for semantic search)
CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    content_chunk TEXT NOT NULL,
    vector_data BLOB, -- Serialized embedding vector
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE(file_id, chunk_index)
);

-- Kodii sessions and interactions
CREATE TABLE IF NOT EXISTS kodii_sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    session_type TEXT NOT NULL, -- 'prd', 'task-graph', 'implement', etc.
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    context_data TEXT, -- JSON context
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Kodii messages/interactions within sessions
CREATE TABLE IF NOT EXISTS kodii_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user', 'kodii', 'system'
    content TEXT NOT NULL,
    metadata TEXT, -- JSON metadata (tokens, model, etc.)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES kodii_sessions(id) ON DELETE CASCADE
);

-- Generated artifacts (PRDs, task graphs, code, tests, etc.)
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL, -- 'prd', 'task-graph', 'code', 'test', 'docs'
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    file_path TEXT, -- If artifact should be written to file
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'implemented'
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES kodii_sessions(id) ON DELETE CASCADE
);

-- Git integration data
CREATE TABLE IF NOT EXISTS git_history (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    commit_hash TEXT NOT NULL,
    commit_message TEXT NOT NULL,
    author_name TEXT,
    author_email TEXT,
    commit_date INTEGER NOT NULL,
    branch_name TEXT,
    files_changed TEXT, -- JSON array of changed files
    insertions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, commit_hash)
);

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_language ON files(language);
CREATE INDEX IF NOT EXISTS idx_files_updated_at ON files(updated_at);
CREATE INDEX IF NOT EXISTS idx_embeddings_file_id ON embeddings(file_id);
CREATE INDEX IF NOT EXISTS idx_kodii_sessions_project_id ON kodii_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_kodii_sessions_type ON kodii_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_kodii_messages_session_id ON kodii_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_session_id ON artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_git_history_project_id ON git_history(project_id);
CREATE INDEX IF NOT EXISTS idx_git_history_commit_date ON git_history(commit_date);

-- Full-text search for content
CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
    content,
    relative_path,
    language,
    content='files',
    content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS files_fts_insert AFTER INSERT ON files BEGIN
    INSERT INTO files_fts(rowid, content, relative_path, language) 
    VALUES (new.rowid, new.content, new.relative_path, new.language);
END;

CREATE TRIGGER IF NOT EXISTS files_fts_delete AFTER DELETE ON files BEGIN
    INSERT INTO files_fts(files_fts, rowid, content, relative_path, language) 
    VALUES ('delete', old.rowid, old.content, old.relative_path, old.language);
END;

CREATE TRIGGER IF NOT EXISTS files_fts_update AFTER UPDATE ON files BEGIN
    INSERT INTO files_fts(files_fts, rowid, content, relative_path, language) 
    VALUES ('delete', old.rowid, old.content, old.relative_path, old.language);
    INSERT INTO files_fts(rowid, content, relative_path, language) 
    VALUES (new.rowid, new.content, new.relative_path, new.language);
END;

-- Update timestamp triggers
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
AFTER UPDATE ON projects BEGIN
    UPDATE projects SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_files_timestamp 
AFTER UPDATE ON files BEGIN
    UPDATE files SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_kodii_sessions_timestamp 
AFTER UPDATE ON kodii_sessions BEGIN
    UPDATE kodii_sessions SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_artifacts_timestamp 
AFTER UPDATE ON artifacts BEGIN
    UPDATE artifacts SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;