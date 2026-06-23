class Campaign < ApplicationRecord
  has_many :donations, dependent: :destroy

  validates :slug, :title, :goal_cents, :currency, presence: true
  validates :slug, uniqueness: true
  validates :goal_cents, numericality: { only_integer: true, greater_than: 0 }
end
