import { supabase } from "./lib/supabaseClient";

async function seedCampaigns() {
  try {
    // First, let's check what columns exist
    const { data: columnData, error: columnError } = await supabase
      .from("hc_campaigns")
      .select("*", { count: "exact", head: true })
      .limit(0);

    console.log("Checking table structure...");

    // Use a valid UUID for created_by
    const createdBy = "123e4567-e89b-12d3-a456-426614174000";
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const campaigns = [
      {
        title: "Education Initiative",
        status: "approved",
        target_amount: 500000,
        created_by: createdBy,
        start_date: today,
        end_date: endDate,
      },
      {
        title: "Medical Assistance",
        status: "approved",
        target_amount: 300000,
        created_by: createdBy,
        start_date: today,
        end_date: endDate,
      },
      {
        title: "Disaster Relief",
        status: "approved",
        target_amount: 1000000,
        created_by: createdBy,
        start_date: today,
        end_date: endDate,
      },
      {
        title: "Clean Water Project",
        status: "approved",
        target_amount: 400000,
        created_by: createdBy,
        start_date: today,
        end_date: endDate,
      },
    ];

    const { data, error } = await supabase
      .from("hc_campaigns")
      .insert(campaigns)
      .select();

    if (error) {
      console.error("Error seeding campaigns:", error);
      return;
    }

    console.log("Successfully seeded campaigns:", data);
  } catch (error) {
    console.error("Seed error:", error);
  }
}

seedCampaigns();
