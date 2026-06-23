class CreateCampaigns < ActiveRecord::Migration[8.1]
  def change
    create_table :campaigns do |t|
      t.string :slug, null: false
      t.string :title, null: false
      t.integer :goal_cents, null: false
      t.string :currency, null: false
      t.string :cover_image_url

      t.timestamps
    end

    add_index :campaigns, :slug, unique: true
  end
end
