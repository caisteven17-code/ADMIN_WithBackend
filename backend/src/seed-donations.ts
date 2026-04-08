import { supabase } from "./lib/supabaseClient";

async function seedDonations() {
  try {
    const donations = [
      { amount_paid: 50 },
      { amount_paid: 900 },
      { amount_paid: 600 },
      { amount_paid: 900 },
      { amount_paid: 400 },
      { amount_paid: 50 },
      { amount_paid: 500 },
      { amount_paid: 500.00 },
      { amount_paid: 500.00 },
      { amount_paid: 1000.00 },
      { amount_paid: 500.00 },
      { amount_paid: 750.00 },
      { amount_paid: 1000.00 },
    ];

    const { data, error } = await supabase
      .from("hopecard_purchases")
      .insert(donations)
      .select();

    if (error) {
      console.error("Error seeding donations:", error);
      return;
    }

    console.log("Successfully seeded donations:");
    console.log("Records added:", data?.length);
    
    const total = data?.reduce((sum, d) => sum + (d.amount_paid || 0), 0) || 0;
    console.log("Total amount:", total);
  } catch (error) {
    console.error("Seed error:", error);
  }
}

seedDonations();
