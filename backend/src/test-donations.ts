import { supabase } from "./lib/supabaseClient";

async function testDonations() {
  try {
    // Try different table names
    const possibleTables = [
      "hopecard_purchases",
      "purchases",
      "donations",
      "hc_purchases",
      "payments"
    ];

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(5);

        if (!error) {
          console.log(`\nTable "${tableName}" found:`);
          console.log("Records:", JSON.stringify(data, null, 2));
          console.log("Count:", data?.length);
        }
      } catch (e) {
        // Table doesn't exist
      }
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testDonations();
