const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY // service role might not be here, let's just test with anon key or fetch it if exists
);

async function test() {
  const { data: bData, error: bError } = await supabase.storage.getBucket('candidate-documents');
  console.log('Bucket exists:', !!bData, bError);

  const buffer = Buffer.from('test content');
  const { data, error } = await supabase.storage.from('candidate-documents').upload('test-file.txt', buffer, { upsert: true });
  console.log('Upload result:', data, error);
}
test();
