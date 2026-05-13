import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtkpusvfjvbehksrbbcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0a3B1c3ZmanZiZWhrc3JiYmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDc4MjgsImV4cCI6MjA5NDIyMzgyOH0.RjITdsG9lqPamuWdxanMi76T8fvaIASd6oF_0Wm26X0';

export const supabase = createClient(supabaseUrl, supabaseKey);