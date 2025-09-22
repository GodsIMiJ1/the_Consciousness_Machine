# 🔥 GhostVault RLS Setup for Ishraya Sanctuary

## Current Status

✅ **Knight's Gate API** - Secure and running  
✅ **FlameKey Authentication** - Working perfectly  
✅ **Read Operations** - All working  
⚠️ **Write Operations** - Blocked by RLS policies  

## The Issue

PostgreSQL Row Level Security (RLS) is enabled on the `memory_crystals` table but no policies exist to allow writes. This is **good security** but needs configuration.

## Solution Options

### Option 1: Configure RLS Policies (RECOMMENDED)

Run the SQL script as a database administrator:

```bash
psql -h localhost -p 5432 -U postgres -d ghostvault -f database/setup-rls-policies.sql
```

This will:
1. Create the `auth.uid()` function
2. Add `owner_id` column if missing
3. Enable RLS with proper policies
4. Allow users to manage their own memory crystals

### Option 2: Temporary Development Bypass

**⚠️ FOR DEVELOPMENT ONLY - NEVER IN PRODUCTION**

Connect to the database and temporarily disable RLS:

```sql
-- Disable RLS temporarily for development
ALTER TABLE public.memory_crystals DISABLE ROW LEVEL SECURITY;

-- Re-enable when ready for production
ALTER TABLE public.memory_crystals ENABLE ROW LEVEL SECURITY;
```

## Database Connection

If you need to connect to the GhostVault database:

```bash
# Try these connection methods:
psql -h localhost -p 5432 -U postgres -d ghostvault
psql -h localhost -p 5432 -U ghostvault -d ghostvault
psql postgresql://postgres:password@localhost:5432/ghostvault
```

## Testing After Setup

Once RLS is configured, test the integration:

```bash
# Test memory crystal creation
curl -X POST http://localhost:3002/api/memory-crystals \
  -H "Content-Type: application/json" \
  -H "X-AGA-ID: ishraya" \
  -d '{
    "thought_type": "system",
    "summary": "First Ishraya memory crystal",
    "full_context": {"session_id": "550e8400-e29b-41d4-a716-446655440000"},
    "tags": ["test", "session-start"],
    "created_by": "ISHRAYA",
    "interaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "archived": false
  }'
```

## Architecture Overview

```
React App (Port 8081)
    ↓
Knight's Gate API (Port 3002)
    ↓ (FlameKey Auth + JWT Context)
GhostVault PostgREST (Port 3000)
    ↓ (RLS Policies)
PostgreSQL Database
```

## Security Features

- **FlameKey Authentication**: Secure API access
- **JWT User Context**: Per-user data isolation
- **RLS Policies**: Database-level security
- **No Credential Exposure**: All secrets stay server-side

## Next Steps

1. **Database Admin**: Run the RLS setup script
2. **Test Integration**: Verify writes work
3. **Full Flow Test**: Create session → send message → generate memory shard
4. **Production Ready**: Remove development bypasses

The foundation is solid - just needs the final database configuration! 🏰
