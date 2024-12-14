import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djjlszpgmrcbgtizptfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamxzenBnbXJjYmd0aXpwdGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg0MzkxNCwiZXhwIjoyMDQ5NDE5OTE0fQ.uTjuUzaF4TEALzplIMXcHryXMBbbB4R0J5kMjK94Obc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        // Check tables
        const { data: tables, error: tablesError } = await supabase
            .rpc('select_tables', {
                sql_query: `
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                `
            });
        
        if (tablesError) {
            console.error('Error getting tables:', tablesError);
        } else {
            console.log('Tables:', tables);
        }

        // Check policies
        const { data: policies, error: policiesError } = await supabase
            .rpc('select_policies', {
                sql_query: `
                    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
                    FROM pg_policies 
                    WHERE schemaname = 'public'
                `
            });

        if (policiesError) {
            console.error('Error getting policies:', policiesError);
        } else {
            console.log('Policies:', policies);
        }

        // Check triggers
        const { data: triggers, error: triggersError } = await supabase
            .rpc('select_triggers', {
                sql_query: `
                    SELECT trigger_name, event_manipulation, event_object_table
                    FROM information_schema.triggers
                    WHERE trigger_schema = 'public'
                `
            });

        if (triggersError) {
            console.error('Error getting triggers:', triggersError);
        } else {
            console.log('Triggers:', triggers);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
