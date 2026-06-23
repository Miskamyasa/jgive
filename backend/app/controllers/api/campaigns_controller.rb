module Api
  class CampaignsController < ApplicationController
    def show
      campaign = find_campaign
      return render_not_found unless campaign

      render json: campaign_json(campaign)
    end
  end
end
