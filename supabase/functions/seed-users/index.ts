import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SEED_USERS = [
  {
    email: "admin@company.com",
    password: "Admin@1234",
    full_name: "System Administrator",
    employee_id: "ADMIN-001",
    department: "IT",
    job_title: "Administrator",
    role: "admin",
    onboarding_batch: "N/A",
  },
  {
    email: "alex.johnson@company.com",
    password: "Demo@1234",
    full_name: "Alex Johnson",
    employee_id: "EMP-101",
    department: "Sales",
    job_title: "Sales Representative",
    role: "employee",
    onboarding_batch: "Batch June 2026",
  },
  {
    email: "test.user@company.com",
    password: "12345678",
    full_name: "Test User",
    employee_id: "TEST-001",
    department: "QA",
    job_title: "Test User",
    role: "employee",
    onboarding_batch: "Test Batch",
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Use service role client to bypass RLS and email confirmation
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // No body or invalid JSON, proceed with default seeding
  }

  const results: string[] = [];

  // Handle new user creation request
  if (body.createNew) {
    try {
      const { data: listData } = await admin.auth.admin.listUsers();
      const existing = listData?.users?.find((u: any) => u.email === body.email);

      if (existing) {
        return new Response(JSON.stringify({ ok: false, error: "User already exists" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
      });
      if (createError || !created?.user) {
        return new Response(JSON.stringify({ ok: false, error: createError?.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const userId = created.user.id;

      await admin.from("profiles").insert({
        id: userId,
        email: body.email,
        full_name: body.full_name,
        employee_id: body.employee_id,
        department: body.department,
        job_title: body.job_title,
        role: body.role || "employee",
        onboarding_batch: `Batch ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}`,
      });

      return new Response(JSON.stringify({ ok: true, results: [`Created: ${body.email}`] }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  // Handle password update only
  if (body.updateOnly && body.email && body.password) {
    try {
      const { data: listData } = await admin.auth.admin.listUsers();
      const existing = listData?.users?.find((u: any) => u.email === body.email);
      if (existing) {
        await admin.auth.admin.updateUserById(existing.id, {
          password: body.password,
        });
        return new Response(JSON.stringify({ ok: true, results: [`Password updated: ${body.email}`] }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  // Default: seed admin and demo accounts
  for (const seed of SEED_USERS) {
    try {
      // Check if user exists in auth.users via admin API
      const { data: listData } = await admin.auth.admin.listUsers();
      const existing = listData?.users?.find((u: any) => u.email === seed.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        // Ensure email is confirmed
        await admin.auth.admin.updateUserById(userId, {
          email_confirm: true,
          password: seed.password,
        });
        results.push(`Updated: ${seed.email}`);
      } else {
        // Create user with confirmed email
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email: seed.email,
          password: seed.password,
          email_confirm: true,
        });
        if (createError || !created?.user) {
          results.push(`Error creating ${seed.email}: ${createError?.message}`);
          continue;
        }
        userId = created.user.id;
        results.push(`Created: ${seed.email}`);
      }

      // Upsert profile
      await admin.from("profiles").upsert({
        id: userId,
        email: seed.email,
        full_name: seed.full_name,
        employee_id: seed.employee_id,
        department: seed.department,
        job_title: seed.job_title,
        role: seed.role,
        onboarding_batch: seed.onboarding_batch,
      }, { onConflict: "id" });

    } catch (err: any) {
      results.push(`Exception for ${seed.email}: ${err.message}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
