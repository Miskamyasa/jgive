import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	createDonation,
	DonationValidationError,
	type DisplayNameMode,
	type Frequency,
} from '../lib/api';
import {
	QueryProvider,
	campaignQueryKey,
	donationsQueryKey,
} from '../lib/queryClient';

const PRESETS = [50, 100, 180, 360] as const;

// Form fields we can attach inline messages to.
type FieldKey = 'amount' | 'donorName';
type FieldErrors = Partial<Record<FieldKey, string>>;

// Maps ActiveRecord error keys (from the 422 { errors } payload) onto form
// fields; anything not listed here is surfaced in the general error area.
const SERVER_FIELD_MAP: Record<string, FieldKey> = {
	amount_cents: 'amount',
	donor_name: 'donorName',
};

function DonationFormView() {
	const queryClient = useQueryClient();

	const [preset, setPreset] = useState<number | null>(180);
	const [customAmount, setCustomAmount] = useState('');
	const [frequency, setFrequency] = useState<Frequency>('one_time');
	const [displayNameMode, setDisplayNameMode] =
		useState<DisplayNameMode>('full_name');
	const [donorName, setDonorName] = useState('');
	const [dedication, setDedication] = useState('');
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [generalError, setGeneralError] = useState<string | null>(null);

	const isAnonymous = displayNameMode === 'anonymous';

	// Custom input takes precedence over a preset when it holds a value.
	const amountShekels =
		customAmount.trim() !== '' ? Number(customAmount) : (preset ?? 0);

	const mutation = useMutation({
		mutationFn: createDonation,
		onSuccess: () => {
			// Shared singleton client => these invalidations refetch the queries
			// read by ProgressIsland and DonorListIsland.
			queryClient.invalidateQueries({ queryKey: campaignQueryKey });
			queryClient.invalidateQueries({ queryKey: donationsQueryKey });
		},
		onError: (error) => {
			if (error instanceof DonationValidationError) {
				const mapped: FieldErrors = {};
				const baseMessages: string[] = [];
				for (const [key, messages] of Object.entries(error.errors)) {
					const message = messages.join(', ');
					const field = SERVER_FIELD_MAP[key];
					if (field) {
						mapped[field] = message;
					} else if (message) {
						baseMessages.push(message);
					}
				}
				setFieldErrors(mapped);
				setGeneralError(
					baseMessages.length > 0
						? baseMessages.join(' ')
						: Object.keys(mapped).length > 0
							? null
							: 'Please check the form and try again.',
				);
				return;
			}
			setGeneralError('Something went wrong. Please try again.');
		},
	});

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		const nextErrors: FieldErrors = {};

		if (!Number.isFinite(amountShekels) || amountShekels <= 0) {
			nextErrors.amount = 'Enter a donation amount greater than zero.';
		}

		const trimmedName = donorName.trim();
		if (!isAnonymous && trimmedName === '') {
			nextErrors.donorName =
				'Enter your name, or choose to give anonymously.';
		}

		setFieldErrors(nextErrors);
		setGeneralError(null);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		mutation.mutate({
			donation: {
				amount_cents: Math.round(amountShekels * 100),
				frequency,
				display_name_mode: displayNameMode,
				donor_name: isAnonymous ? undefined : trimmedName,
				dedication: dedication.trim() === '' ? undefined : dedication.trim(),
			},
		});
	}

	const succeeded = mutation.isSuccess;

	return (
		<form className="donation-form" onSubmit={handleSubmit} noValidate>
			<h2 className="df-title">Make a donation</h2>

			<fieldset className="df-field">
				<legend>Amount (&#8362;)</legend>
				<div className="df-presets">
					{PRESETS.map((value) => (
						<button
							type="button"
							key={value}
							className={
								preset === value && customAmount.trim() === ''
									? 'df-preset df-preset--active'
									: 'df-preset'
							}
							onClick={() => {
								setPreset(value);
								setCustomAmount('');
							}}
						>
							&#8362;{value}
						</button>
					))}
				</div>
				<input
					className="df-input"
					type="number"
					min="1"
					step="1"
					inputMode="numeric"
					placeholder="Custom amount"
					value={customAmount}
					onChange={(event) => {
						setCustomAmount(event.target.value);
						setPreset(null);
					}}
					aria-label="Custom amount in shekels"
					aria-invalid={fieldErrors.amount ? true : undefined}
				/>
				{fieldErrors.amount && (
					<p className="df-field-error" role="alert">
						{fieldErrors.amount}
					</p>
				)}
			</fieldset>

			<fieldset className="df-field">
				<legend>Frequency</legend>
				<div className="df-radio-row">
					<label className="df-radio">
						<input
							type="radio"
							name="frequency"
							value="one_time"
							checked={frequency === 'one_time'}
							onChange={() => setFrequency('one_time')}
						/>
						One-time
					</label>
					<label className="df-radio">
						<input
							type="radio"
							name="frequency"
							value="recurring"
							checked={frequency === 'recurring'}
							onChange={() => setFrequency('recurring')}
						/>
						Recurring
					</label>
				</div>
			</fieldset>

			<div className="df-field">
				<label className="df-label" htmlFor="df-display-mode">
					Display preference
				</label>
				<select
					id="df-display-mode"
					className="df-input"
					value={displayNameMode}
					onChange={(event) =>
						setDisplayNameMode(event.target.value as DisplayNameMode)
					}
				>
					<option value="full_name">Show my full name</option>
					<option value="first_name">Show my first name only</option>
					<option value="anonymous">Give anonymously</option>
				</select>
			</div>

			<div className="df-field">
				<label className="df-label" htmlFor="df-donor-name">
					Your name{isAnonymous ? ' (optional)' : ''}
				</label>
				<input
					id="df-donor-name"
					className="df-input"
					type="text"
					value={donorName}
					onChange={(event) => setDonorName(event.target.value)}
					disabled={isAnonymous}
					placeholder={isAnonymous ? 'Not shown — anonymous' : 'Full name'}
					aria-invalid={fieldErrors.donorName ? true : undefined}
				/>
				{fieldErrors.donorName && (
					<p className="df-field-error" role="alert">
						{fieldErrors.donorName}
					</p>
				)}
			</div>

			<div className="df-field">
				<label className="df-label" htmlFor="df-dedication">
					Dedication (optional)
				</label>
				<textarea
					id="df-dedication"
					className="df-input"
					rows={2}
					value={dedication}
					onChange={(event) => setDedication(event.target.value)}
					placeholder="In memory of…"
				/>
			</div>

			{generalError && (
				<p className="df-error" role="alert">
					{generalError}
				</p>
			)}
			{succeeded && (
				<p className="df-success" role="status">
					Thank you &mdash; your donation is pending.
				</p>
			)}

			<button
				type="submit"
				className="df-submit"
				disabled={mutation.isPending}
			>
				{mutation.isPending ? 'Submitting…' : 'Donate'}
			</button>

			<style>{`
				.donation-form {
					display: flex;
					flex-direction: column;
					gap: 1rem;
					max-width: 520px;
					width: 100%;
					margin: 1.5rem auto 0;
					padding: 1.5rem;
					border: 1px solid var(--border);
					border-radius: 16px;
					background: #fff;
				}
				.donation-form .df-title {
					margin: 0;
					font-size: 1.25rem;
					font-weight: 800;
				}
				.donation-form .df-field {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
					border: none;
					margin: 0;
					padding: 0;
				}
				.donation-form legend,
				.donation-form .df-label {
					font-weight: 600;
					font-size: 0.95rem;
					padding: 0;
				}
				.donation-form .df-presets {
					display: flex;
					gap: 0.5rem;
					flex-wrap: wrap;
				}
				.donation-form .df-preset {
					flex: 1 1 0;
					min-width: 64px;
					padding: 0.6rem 0.5rem;
					border: 1px solid var(--border);
					border-radius: 999px;
					background: #fff;
					font: inherit;
					font-weight: 600;
					cursor: pointer;
				}
				.donation-form .df-preset--active {
					color: #fff;
					background: var(--accent-magenta-bright);
					border-color: var(--accent-magenta-bright);
				}
				.donation-form .df-input {
					font: inherit;
					padding: 0.6rem 0.75rem;
					border: 1px solid var(--border);
					border-radius: 10px;
					background: #fff;
					width: 100%;
				}
				.donation-form .df-input:disabled {
					background: #f3f3f3;
					color: var(--text-muted);
				}
				.donation-form .df-radio-row {
					display: flex;
					gap: 1.25rem;
				}
				.donation-form .df-radio {
					display: inline-flex;
					align-items: center;
					gap: 0.4rem;
					font-weight: 500;
				}
				.donation-form .df-error {
					margin: 0;
					color: #b00020;
					font-size: 0.9rem;
				}
				.donation-form .df-field-error {
					margin: 0;
					color: #b00020;
					font-size: 0.85rem;
				}
				.donation-form .df-input[aria-invalid='true'] {
					border-color: #b00020;
				}
				.donation-form .df-success {
					margin: 0;
					color: var(--progress-green);
					font-weight: 600;
				}
				.donation-form .df-submit {
					font: inherit;
					font-weight: 700;
					font-size: 1.1rem;
					color: #fff;
					background: var(--accent-magenta-bright);
					border: none;
					padding: 0.85rem 1.5rem;
					border-radius: 999px;
					cursor: pointer;
				}
				.donation-form .df-submit:hover:not(:disabled) {
					background: var(--accent-magenta);
				}
				.donation-form .df-submit:disabled {
					opacity: 0.6;
					cursor: progress;
				}
			`}</style>
		</form>
	);
}

export default function DonationForm() {
	return (
		<QueryProvider>
			<DonationFormView />
		</QueryProvider>
	);
}
