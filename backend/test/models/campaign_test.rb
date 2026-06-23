require "test_helper"

class CampaignTest < ActiveSupport::TestCase
  test "rejects missing required fields" do
    required_fields = [ :slug, :title, :goal_cents, :currency ]

    required_fields.each do |field|
      campaign = valid_campaign
      campaign.public_send("#{field}=", nil)

      assert_not campaign.valid?, "Expected campaign without #{field} to be invalid"
      assert_includes campaign.errors[field], "can't be blank"
    end
  end

  test "rejects duplicate slug" do
    Campaign.create!(slug: "jgive", title: "First", goal_cents: 100_00, currency: "USD")
    duplicate = valid_campaign(slug: "jgive")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:slug], "has already been taken"
  end

  private

  def valid_campaign(attributes = {})
    Campaign.new({ slug: "campaign-#{SecureRandom.hex(4)}", title: "Campaign", goal_cents: 100_00, currency: "USD" }.merge(attributes))
  end
end
