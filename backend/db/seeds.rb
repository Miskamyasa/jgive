# Canonical campaign slug for the Astro page: "the-orange-garden".

campaign = Campaign.find_or_create_by!(slug: "the-orange-garden") do |record|
  record.title = "The Orange Garden"
  record.goal_cents = 500_000_000
  record.currency = "ILS"
  record.cover_image_url = "https://placehold.co/1200x600?text=The+Orange+Garden"
end

if campaign.donations.empty?
  campaign.donations.create!([
    {
      amount_cents: 18_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Varda Turgeman",
      dedication: "In loving memory of the Bibas family and the children of October 7."
    },
    {
      amount_cents: 18_000,
      frequency: :one_time,
      display_name_mode: :first_name,
      donor_name: "Anat"
    },
    {
      amount_cents: 10_000,
      frequency: :one_time,
      display_name_mode: :anonymous
    },
    {
      amount_cents: 5_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Shula Sappir"
    },
    {
      amount_cents: 26_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Rachel Davush",
      dedication: "May this garden bring light, comfort, and hope."
    },
    {
      amount_cents: 10_000,
      frequency: :one_time,
      display_name_mode: :first_name,
      donor_name: "Ayala"
    },
    {
      amount_cents: 36_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Dani Albuher"
    },
    {
      amount_cents: 2_000,
      frequency: :one_time,
      display_name_mode: :anonymous,
      dedication: "For the children, with a prayer for peace."
    },
    {
      amount_cents: 5_000,
      frequency: :one_time,
      display_name_mode: :first_name,
      donor_name: "Miriam"
    },
    {
      amount_cents: 36_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Eli Cohen"
    },
    {
      amount_cents: 18_000,
      frequency: :one_time,
      display_name_mode: :anonymous
    },
    {
      amount_cents: 20_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Noa Ben-David",
      dedication: "Planting orange blossoms in their memory."
    },
    {
      amount_cents: 26_000,
      frequency: :one_time,
      display_name_mode: :first_name,
      donor_name: "Yair"
    },
    {
      amount_cents: 180_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Tamar Levy"
    },
    {
      amount_cents: 90_000,
      frequency: :recurring,
      display_name_mode: :anonymous
    },
    {
      amount_cents: 72_000,
      frequency: :one_time,
      display_name_mode: :full_name,
      donor_name: "Oren Mizrahi"
    }
  ])
end
