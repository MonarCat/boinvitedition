# Supabase Database Guide for Boinvit

## Overview

This guide explains how to manage and apply database changes to your Supabase instance for the Boinvit platform.

## Database Structure

The Boinvit application uses Supabase as its backend database. The main tables include:

### Core Tables

1. **businesses** - Stores business/organization information
   - Contains organization details, settings, subscription tier
   - Links to user accounts via `user_id`

2. **services** - Stores meeting/training types
   - Meeting or training session configurations
   - Duration, description, and other details
   - Links to businesses via `business_id`

3. **staff** - Employee/staff information
   - Employee records and roles
   - Department assignments
   - Links to businesses via `business_id`

4. **bookings** - Meeting/training session bookings
   - Scheduled meetings and training sessions
   - Attendance tracking
   - Status management (pending, confirmed, completed, cancelled)
   - Links to businesses, services, and staff

5. **payments** - Payment transaction records
   - Transaction history
   - Payment status tracking
   - Links to bookings and businesses

6. **reviews** - Feedback and ratings
   - Service/meeting ratings
   - Client feedback
   - Links to bookings and services

## Migration Files

Database schema changes are managed through SQL migration files located in:
```
/supabase/migrations/
```

### Key Migration Files

- `20240520_schema.sql` - Base schema with core tables
- `20250614000001_add_location_support.sql` - Location features
- `20250703120000_enhance_realtime_publications.sql` - Real-time updates
- Additional timestamped migrations for incremental changes

## How to Apply Database Changes

### Method 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Find your project ref in Supabase Dashboard → Settings → General

4. **Apply Migrations**
   ```bash
   # Apply all pending migrations
   supabase db push
   
   # Or apply specific migration
   supabase db push --file supabase/migrations/MIGRATION_FILE.sql
   ```

5. **Verify Changes**
   ```bash
   supabase db diff
   ```

### Method 2: Using Supabase Dashboard

1. **Access SQL Editor**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor in the left sidebar

2. **Run Migration SQL**
   - Open the migration file you want to apply
   - Copy the SQL content
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Changes**
   - Navigate to Table Editor to see the updated schema
   - Check that tables, columns, and relationships are correct

### Method 3: Using Migration Scripts Directly

If you have direct database access:

```bash
# Connect to your database
psql -h YOUR_DB_HOST -U postgres -d postgres

# Run migration file
\i supabase/migrations/MIGRATION_FILE.sql
```

## Creating New Migrations

### Using Supabase CLI

1. **Create a new migration file**
   ```bash
   supabase migration new your_migration_name
   ```

2. **Edit the generated file**
   - File will be created in `supabase/migrations/`
   - Add your SQL changes
   - Use proper naming: `YYYYMMDD_description.sql`

3. **Test locally** (if using local Supabase)
   ```bash
   supabase start
   supabase db reset
   ```

4. **Apply to production**
   ```bash
   supabase db push
   ```

### Manual Migration Creation

1. **Create a new file**
   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
   ```

2. **Write your SQL**
   Example structure:
   ```sql
   -- Description of what this migration does
   
   -- Add new column
   ALTER TABLE businesses ADD COLUMN IF NOT EXISTS new_field TEXT;
   
   -- Create index for performance
   CREATE INDEX IF NOT EXISTS idx_businesses_new_field ON businesses(new_field);
   
   -- Update existing data if needed
   UPDATE businesses SET new_field = 'default_value' WHERE new_field IS NULL;
   ```

3. **Apply the migration** using one of the methods above

## Best Practices

### 1. Always Use Migrations
- Never make manual changes directly in production
- Always create migration files for tracking
- Version control all migrations in Git

### 2. Test Before Applying
- Test migrations in a development/staging environment first
- Use `supabase db reset` locally to test from scratch
- Verify data integrity after migrations

### 3. Make Migrations Idempotent
Use `IF NOT EXISTS` and `IF EXISTS` clauses:
```sql
-- Good
CREATE TABLE IF NOT EXISTS my_table (...);
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS my_column TEXT;

-- Avoid
CREATE TABLE my_table (...);
ALTER TABLE my_table ADD COLUMN my_column TEXT;
```

### 4. Include Rollback Instructions
Comment how to reverse the migration:
```sql
-- Migration: Add email_verified column
-- Rollback: ALTER TABLE users DROP COLUMN IF EXISTS email_verified;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

### 5. Handle Data Carefully
- Back up data before destructive operations
- Use transactions when appropriate
- Test with production-like data volumes

### 6. Index Important Columns
```sql
-- Add indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
```

### 7. Set Up Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);
```

## Common Migration Tasks

### Adding a New Column
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name DATA_TYPE DEFAULT default_value;
```

### Modifying an Existing Column
```sql
ALTER TABLE table_name 
ALTER COLUMN column_name TYPE NEW_TYPE;
```

### Creating a New Table
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  -- other columns
);
```

### Adding Foreign Key
```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) 
REFERENCES parent_table(id)
ON DELETE CASCADE;
```

### Creating an Index
```sql
CREATE INDEX IF NOT EXISTS idx_name 
ON table_name(column_name);
```

## Troubleshooting

### Migration Fails to Apply
1. Check for syntax errors in SQL
2. Verify table/column names are correct
3. Check if migration already applied (use idempotent SQL)
4. Look at Supabase logs for detailed error messages

### RLS Blocking Queries
1. Verify RLS policies are correctly defined
2. Check that `auth.uid()` matches expected user
3. Use SQL Editor to test queries as specific users
4. Temporarily disable RLS for debugging (re-enable after!)

### Performance Issues After Migration
1. Check if indexes are in place
2. Run `ANALYZE table_name;` to update statistics
3. Use `EXPLAIN ANALYZE` to check query plans
4. Consider adding composite indexes for complex queries

## Getting Help

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **SQL Reference**: https://www.postgresql.org/docs/

## Security Reminders

1. **Never commit sensitive data** to migration files
2. **Use environment variables** for secrets
3. **Enable RLS** on all tables with user data
4. **Test RLS policies** thoroughly before production
5. **Regular backups** - Enable point-in-time recovery in Supabase dashboard
6. **Monitor database** - Set up alerts for unusual activity

## Backup and Recovery

### Automated Backups
Supabase provides automatic daily backups. Configure in Dashboard:
- Settings → Database → Backup Settings

### Manual Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Restore
psql -h YOUR_DB_HOST -U postgres -d postgres < backup.sql
```

### Point-in-Time Recovery
Available on Pro plan and above:
- Dashboard → Settings → Database → Point in Time Recovery

## Next Steps

1. Review existing migration files to understand current schema
2. Set up local Supabase for safe testing
3. Create a staging environment for testing migrations
4. Document any custom business logic in database functions
5. Set up monitoring and alerts for database health

---

**Note**: Always test database changes in a non-production environment first!
