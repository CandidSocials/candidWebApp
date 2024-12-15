import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djjlszpgmrcbgtizptfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamxzenBnbXJjYmd0aXpwdGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg0MzkxNCwiZXhwIjoyMDQ5NDE5OTE0fQ.uTjuUzaF4TEALzplIMXcHryXMBbbB4R0J5kMjK94Obc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        // Check tables
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables');
        
        if (tablesError) {
            console.error('Error getting tables:', tablesError);
        } else {
            console.log('Tables:', tables);
        }

        // Direct SQL query for tables
        const { data: tablesList, error: tablesListError } = await supabase
            .from('_tables')
            .select('*');

        if (tablesListError) {
            console.error('Error getting tables list:', tablesListError);
        } else {
            console.log('Tables List:', tablesList);
        }

        // Direct SQL query for policies
        const { data: policies, error: policiesError } = await supabase
            .from('_policies')
            .select('*');

        if (policiesError) {
            console.error('Error getting policies:', policiesError);
        } else {
            console.log('Policies:', policies);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
