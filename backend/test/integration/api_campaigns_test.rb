require "test_helper"

class ApiCampaignsTest < ActionDispatch::IntegrationTest
  setup do
    @campaign = Campaign.create!(slug: "water-fund", title: "Water Fund", goal_cents: 10_000, currency: "USD")
  end

  test "show returns campaign with calculated progress" do
    create_donation!(amount_cents: 1_000, donor_name: "Ada Lovelace")
    create_donation!(amount_cents: 2_500, donor_name: "Grace Hopper")

    get api_campaign_path(@campaign.slug)

    assert_response :success
    body = response.parsed_body
    assert_equal @campaign.id, body["id"]
    assert_equal @campaign.slug, body["slug"]
    assert_equal 3_500, body.dig("progress", "raised_cents")
    assert_equal 2, body.dig("progress", "donor_count")
    assert_equal 35.0, body.dig("progress", "percent")
  end

  test "donations are newest first and display names are masked" do
    oldest = create_donation!(
      donor_name: "Ada Lovelace",
      display_name_mode: "full_name",
      created_at: 3.hours.ago
    )
    middle = create_donation!(
      donor_name: "Grace Hopper",
      display_name_mode: "first_name",
      created_at: 2.hours.ago
    )
    newest = create_donation!(
      donor_name: nil,
      display_name_mode: "anonymous",
      created_at: 1.hour.ago
    )

    get api_campaign_donations_path(@campaign.slug)

    assert_response :success
    donations = response.parsed_body["donations"]
    assert_equal [ newest.id, middle.id, oldest.id ], donations.map { |donation| donation["id"] }
    assert_equal [ "Anonymous", "Grace", "Ada Lovelace" ], donations.map { |donation| donation["display_name"] }
  end

  test "donations are paginated with an opaque cursor" do
    oldest = create_donation!(created_at: 3.hours.ago)
    middle = create_donation!(created_at: 2.hours.ago)
    newest = create_donation!(created_at: 1.hour.ago)

    get api_campaign_donations_path(@campaign.slug), params: { limit: 2 }

    assert_response :success
    first_page = response.parsed_body
    assert_equal [ newest.id, middle.id ], first_page["donations"].map { |donation| donation["id"] }
    assert first_page["next_cursor"].present?

    get api_campaign_donations_path(@campaign.slug), params: { limit: 2, cursor: first_page["next_cursor"] }

    assert_response :success
    second_page = response.parsed_body
    assert_equal [ oldest.id ], second_page["donations"].map { |donation| donation["id"] }
    assert_nil second_page["next_cursor"]
  end

  test "invalid cursor degrades to the first page" do
    oldest = create_donation!(created_at: 2.hours.ago)
    newest = create_donation!(created_at: 1.hour.ago)

    get api_campaign_donations_path(@campaign.slug)
    assert_response :success
    first_page = response.parsed_body["donations"].map { |donation| donation["id"] }
    assert_equal [ newest.id, oldest.id ], first_page

    get api_campaign_donations_path(@campaign.slug), params: { cursor: "not-a-valid-cursor" }

    assert_response :success
    assert_equal first_page, response.parsed_body["donations"].map { |donation| donation["id"] }
  end

  test "donations with the same created_at page deterministically by id" do
    timestamp = 1.hour.ago
    lower = create_donation!(created_at: timestamp)
    higher = create_donation!(created_at: timestamp)
    assert higher.id > lower.id

    get api_campaign_donations_path(@campaign.slug), params: { limit: 1 }

    assert_response :success
    first_page = response.parsed_body
    assert_equal [ higher.id ], first_page["donations"].map { |donation| donation["id"] }
    assert first_page["next_cursor"].present?

    get api_campaign_donations_path(@campaign.slug), params: { limit: 1, cursor: first_page["next_cursor"] }

    assert_response :success
    second_page = response.parsed_body
    assert_equal [ lower.id ], second_page["donations"].map { |donation| donation["id"] }
    assert_nil second_page["next_cursor"]
  end

  test "valid donation request creates pending donation and returns updated progress" do
    create_donation!(amount_cents: 1_000, donor_name: "Existing Donor")

    assert_difference("Donation.count", 1) do
      post api_campaign_donations_path(@campaign.slug), params: {
        donation: {
          amount_cents: 2_000,
          frequency: "recurring",
          display_name_mode: "first_name",
          donor_name: "New Donor",
          dedication: "In honor"
        }
      }, as: :json
    end

    assert_response :created
    body = response.parsed_body
    donation = Donation.order(:created_at).last
    assert_equal "pending", donation.status
    assert_equal donation.id, body.dig("donation", "id")
    assert_equal "New", body.dig("donation", "display_name")
    assert_equal 3_000, body.dig("progress", "raised_cents")
    assert_equal 2, body.dig("progress", "donor_count")
  end

  test "invalid donation request returns errors without creating donation" do
    assert_no_difference("Donation.count") do
      post api_campaign_donations_path(@campaign.slug), params: {
        donation: {
          amount_cents: 0,
          frequency: "one_time",
          display_name_mode: "full_name",
          donor_name: nil
        }
      }, as: :json
    end

    assert_response :unprocessable_entity
    errors = response.parsed_body["errors"]
    assert errors["amount_cents"].present?
    assert errors["donor_name"].present?
  end

  test "show returns not found for missing campaign" do
    get api_campaign_path("missing-campaign")

    assert_response :not_found
  end

  private

  def create_donation!(attributes = {})
    defaults = {
      amount_cents: 1_000,
      frequency: "one_time",
      display_name_mode: "full_name",
      donor_name: "Ada Lovelace",
      status: "pending"
    }

    @campaign.donations.create!(defaults.merge(attributes))
  end
end
