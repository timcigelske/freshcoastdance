import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_USERS = [
  { id: "11111111-0000-0000-0000-000000000001", email: "owner@freshcoastdance.com",          full_name: "Diane Holloway",  role: "owner",   household_id: null },
  { id: "11111111-0000-0000-0000-000000000002", email: "admin@freshcoastdance.com",           full_name: "Marcus Webb",    role: "admin",   household_id: null },
  { id: "11111111-0000-0000-0000-000000000003", email: "info@freshcoastdance.com",            full_name: "Priya Nair",     role: "admin",   household_id: null },
  { id: "11111111-0000-0000-0000-000000000004", email: "teacher.ballet@freshcoastdance.com", full_name: "Sophia Reyes",   role: "teacher", household_id: null },
  { id: "11111111-0000-0000-0000-000000000005", email: "teacher.tap@freshcoastdance.com",    full_name: "Jordan Ellis",   role: "teacher", household_id: null },
  { id: "11111111-0000-0000-0000-000000000006", email: "teacher.jazz@freshcoastdance.com",   full_name: "Nia Foster",     role: "teacher", household_id: null },
  { id: "11111111-0000-0000-0000-000000000007", email: "teacher.acro@freshcoastdance.com",   full_name: "Caleb Monroe",   role: "teacher", household_id: null },
  { id: "11111111-0000-0000-0000-000000000008", email: "teacher.leaps@freshcoastdance.com",  full_name: "Hannah Park",    role: "teacher", household_id: null },
  { id: "22222222-0000-0000-0000-000000000001", email: "parent1@example.com",  full_name: "Laurel Thornton",   role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000001" },
  { id: "22222222-0000-0000-0000-000000000002", email: "parent2@example.com",  full_name: "Chris Delacroix",   role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000002" },
  { id: "22222222-0000-0000-0000-000000000003", email: "parent3@example.com",  full_name: "Tamara Kingsley",   role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000003" },
  { id: "22222222-0000-0000-0000-000000000004", email: "parent4@example.com",  full_name: "Ben Okafor",        role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000004" },
  { id: "22222222-0000-0000-0000-000000000005", email: "parent5@example.com",  full_name: "Rachel Nguyen",     role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000005" },
  { id: "22222222-0000-0000-0000-000000000006", email: "parent6@example.com",  full_name: "James Whitfield",   role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000006" },
  { id: "22222222-0000-0000-0000-000000000007", email: "parent7@example.com",  full_name: "Sofia Castillo",    role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000007" },
  { id: "22222222-0000-0000-0000-000000000008", email: "parent8@example.com",  full_name: "Aaron Bernstein",   role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000008" },
  { id: "22222222-0000-0000-0000-000000000009", email: "parent9@example.com",  full_name: "Maya Laurent",      role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000009" },
  { id: "22222222-0000-0000-0000-000000000010", email: "parent10@example.com", full_name: "Derek Malone",      role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000010" },
  { id: "22222222-0000-0000-0000-000000000011", email: "parent11@example.com", full_name: "Candace Flores",    role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000011" },
  { id: "22222222-0000-0000-0000-000000000012", email: "parent12@example.com", full_name: "Trevor Washington", role: "parent", household_id: "aaaaaaaa-0000-0000-0000-000000000012" },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const u of DEMO_USERS) {
      // Create auth user with Admin API -- properly hashes the password
      const { data, error } = await admin.auth.admin.createUser({
        user_metadata: { full_name: u.full_name },
        email: u.email,
        password: "FreshCoast2026!",
        email_confirm: true,
      });

      if (error && !error.message.includes("already been registered")) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }

      // Use the returned ID (or the fixed ID if already existed)
      const authId = data?.user?.id ?? u.id;

      // Upsert profile with the correct fixed UUID if possible,
      // otherwise use whatever the admin API returned
      const { error: profErr } = await admin.from("profiles").upsert({
        id: authId,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        household_id: u.household_id,
        is_active: true,
      }, { onConflict: "id" });

      results.push({
        email: u.email,
        status: profErr ? `profile_error: ${profErr.message}` : "ok",
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
