class CreateDonations < ActiveRecord::Migration[8.1]
  def change
    create_table :donations do |t|
      t.references :campaign, null: false, foreign_key: true
      t.integer :amount_cents, null: false
      t.string :frequency, null: false
      t.string :display_name_mode, null: false
      t.string :donor_name
      t.text :dedication
      t.string :status, null: false, default: "pending"

      t.timestamps
    end
  end
end
