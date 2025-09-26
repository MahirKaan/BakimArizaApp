import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uepmtcfzyosbnmxxcinj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcG10Y2Z6eW9zYm5teHhjaW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTI2NTEsImV4cCI6MjA3NDQ2ODY1MX0.wnXN_gRo24iXmLs9Cao6X287iLJLtiVpnfm6IwSIBBo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
