import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjccxltkogonlqvdhtiq.supabase.co';
const supabaseKey = 'sb_publishable_KbZ6uWcg-50QGLWM82VHZA_Cf8TY9oS';

export const supabase = createClient(supabaseUrl, supabaseKey);
