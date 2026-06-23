module Api
  class DonationsController < ApplicationController
    before_action :set_campaign

    DEFAULT_LIMIT = 20
    MAX_LIMIT = 50
    MIN_LIMIT = 1

    def index
      limit = parse_limit(params[:limit])

      scope = @campaign.donations.order(created_at: :desc, id: :desc)
      scope = apply_cursor(scope, params[:cursor])

      rows = scope.limit(limit + 1).to_a
      has_more = rows.size > limit
      page = rows.first(limit)

      render json: {
        donations: page.map { |donation| donation_json(donation) },
        next_cursor: has_more ? encode_cursor(page.last) : nil
      }
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

    def parse_limit(raw)
      limit = raw.to_s.match?(/\A\d+\z/) ? raw.to_i : DEFAULT_LIMIT
      limit.clamp(MIN_LIMIT, MAX_LIMIT)
    end

    def apply_cursor(scope, raw)
      created_at, id = decode_cursor(raw)
      return scope unless created_at && id

      scope.where(
        "created_at < :created_at OR (created_at = :created_at AND id < :id)",
        created_at: created_at, id: id
      )
    end

    def encode_cursor(donation)
      Base64.urlsafe_encode64("#{donation.created_at.iso8601(6)}|#{donation.id}")
    end

    def decode_cursor(raw)
      return nil if raw.blank?

      decoded = Base64.urlsafe_decode64(raw)
      created_at_iso, id = decoded.split("|", 2)
      created_at = Time.iso8601(created_at_iso)
      return nil unless id.to_s.match?(/\A\d+\z/)

      [ created_at, id.to_i ]
    rescue ArgumentError
      nil
    end
  end
end
