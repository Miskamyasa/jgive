module Api
  class DonationsController < ApplicationController
    before_action :set_campaign

    def index
      donations = @campaign.donations.order(created_at: :desc).limit(20)

      render json: donations.map { |donation| donation_json(donation) }
    end

    def create
      donation = @campaign.donations.new(donation_params)
      donation.status = :pending

      if donation.save
        render json: {
          donation: donation_json(donation),
          progress: campaign_progress(@campaign)
        }, status: :created
      else
        render json: { errors: donation.errors.to_hash }, status: :unprocessable_entity
      end
    end

    private

    def set_campaign
      @campaign = find_campaign
      render_not_found unless @campaign
    end

    def donation_params
      source = params[:donation].present? ? params.require(:donation) : params
      source.permit(:amount_cents, :frequency, :display_name_mode, :donor_name, :dedication)
    end
  end
end
