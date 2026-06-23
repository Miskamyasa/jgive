class Donation < ApplicationRecord
  belongs_to :campaign

  enum :frequency, { one_time: "one_time", recurring: "recurring" }, validate: true
  enum :display_name_mode, { full_name: "full_name", first_name: "first_name", anonymous: "anonymous" }, validate: true
  enum :status, { pending: "pending" }, default: :pending, validate: true

  validates :amount_cents, :frequency, :display_name_mode, :status, presence: true
  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :donor_name, presence: true, unless: :anonymous?
end
