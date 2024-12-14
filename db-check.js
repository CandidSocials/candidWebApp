const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djjlszpgmrcbgtizptfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamxzenBnbXJjYmd0aXpwdGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg0MzkxNCwiZXhwIjoyMDQ5NDE5OTE0fQ.uTjuUzaF4TEALzplIMXcHryXMBbbB4R0J5kMjK94Obc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        // Check tables
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        
        if (tablesError) throw tablesError;
        console.log('Tables:', tables);

        // Check RLS policies
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_policies')
            .select('*');

        if (policiesError) throw policiesError;
        console.log('Policies:', policies);

        // Check triggers
        const { data: triggers, error: triggersError } = await supabase
            .from('information_schema.triggers')
            .select('*')
            .eq('trigger_schema', 'public');

        if (triggersError) throw triggersError;
        console.log('Triggers:', triggers);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
