import { createClient } from "../../lib/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("users").select("count");

  return (
    <div>
      <h1>DB Connection Test</h1>
      {error ? (
        <p style={{ color: "red" }}>Error: {error.message}</p>
      ) : (
        <p style={{ color: "green" }}>
          ✅ Connected! Users count: {JSON.stringify(data)}
        </p>
      )}
    </div>
  );
}
