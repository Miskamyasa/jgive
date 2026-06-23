require "test_helper"

class DonationTest < ActiveSupport::TestCase
  setup do
    @campaign = Campaign.create!(slug: "test-campaign", title: "Test Campaign", goal_cents: 100_00, currency: "USD")
  end

  test "defaults to pending status" do
    donation = Donation.new(valid_attributes)

    assert_equal "pending", donation.status
  end

  test "rejects invalid frequency" do
    donation = Donation.new(valid_attributes(frequency: "weekly"))

    assert_not donation.valid?
    assert donation.errors[:frequency].present?
  end

  test "rejects invalid display name mode" do
    donation = Donation.new(valid_attributes(display_name_mode: "nickname"))

    assert_not donation.valid?
    assert donation.errors[:display_name_mode].present?
  end

  test "rejects non-positive amount" do
    [ 0, -1 ].each do |amount|
      donation = Donation.new(valid_attributes(amount_cents: amount))

      assert_not donation.valid?, "Expected amount_cents #{amount} to be invalid"
      assert donation.errors[:amount_cents].present?
    end
  end

  test "anonymous donation is valid without donor name" do
    donation = Donation.new(valid_attributes(display_name_mode: "anonymous", donor_name: nil))

    assert donation.valid?
  end

  test "full name and first name donations require donor name" do
    [ "full_name", "first_name" ].each do |mode|
      donation = Donation.new(valid_attributes(display_name_mode: mode, donor_name: nil))

      assert_not donation.valid?, "Expected #{mode} donation without donor_name to be invalid"
      assert_includes donation.errors[:donor_name], "can't be blank"
    end
  end

  private

  def valid_attributes(attributes = {})
    {
      campaign: @campaign,
      amount_cents: 2_500,
      frequency: "one_time",
      display_name_mode: "full_name",
      donor_name: "Ada Lovelace"
    }.merge(attributes)
  end
end
