module Api
  class ApplicationController < ::ApplicationController
    private

    def find_campaign
      Campaign.find_by(slug: params[:campaign_id] || params[:id]) || find_campaign_by_id
    end

    def find_campaign_by_id
      lookup_id = params[:campaign_id] || params[:id]
      return unless lookup_id.to_s.match?(/\A\d+\z/)

      Campaign.find_by(id: lookup_id)
    end

    def render_not_found
      render json: { error: "Not found" }, status: :not_found
    end

    def campaign_json(campaign)
      campaign.as_json(only: [ :id, :slug, :title, :goal_cents, :currency, :cover_image_url ]).merge(
        progress: campaign_progress(campaign)
      )
    end

    def campaign_progress(campaign)
      raised_cents = campaign.donations.sum(:amount_cents)
      donor_count = campaign.donations.count
      percent = (raised_cents.to_f / campaign.goal_cents * 100).round(2)

      {
        raised_cents: raised_cents,
        donor_count: donor_count,
        percent: [ percent, 100 ].min
      }
    end

    def donation_json(donation)
      donation.as_json(only: [ :id, :amount_cents, :frequency, :display_name_mode, :dedication, :created_at ]).merge(
        display_name: display_name_for(donation)
      )
    end

    def display_name_for(donation)
      case donation.display_name_mode
      when "anonymous"
        "Anonymous"
      when "first_name"
        donation.donor_name.to_s.split.first.to_s
      else
        donation.donor_name.to_s
      end
    end
  end
end
