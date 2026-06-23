import { useRef, useState } from "react";

import DonationForm from "./DonationForm.tsx";

// Hosts the existing DonationForm inside a native <dialog>. The form is only
// rendered while the dialog is open, so it is not present on initial page load.
export default function DonationDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function openDialog() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  // <dialog> fires "close" for the close button, Escape, and programmatic
  // close(); unmount the form afterward so it never lingers in the DOM.
  function handleClose() {
    setOpen(false);
  }

  // Clicking the dialog backdrop targets the <dialog> element itself (the inner
  // content is a child), so close only when the click is outside that content.
  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      closeDialog();
    }
  }

  return (
    <>
      <button
        type="button"
        className="donate-btn"
        onClick={openDialog}
      >
        Donate
      </button>

      <dialog
        ref={dialogRef}
        className="donation-dialog"
        onClose={handleClose}
        onClick={handleClick}
      >
        <div className="donation-dialog__content">
          <button
            type="button"
            className="donation-dialog__close"
            aria-label="Close"
            onClick={closeDialog}
          >
            &times;
          </button>
          {open && <DonationForm />}
        </div>
      </dialog>

      <style>
        {`
				.donate-btn {
					width: 100%;
					text-align: center;
					font: inherit;
					color: #fff;
					background: var(--accent-magenta-bright);
					border: none;
					padding: 0.85rem 1.5rem;
					border-radius: 999px;
					font-weight: 600;
					font-size: 1.1rem;
					cursor: pointer;
				}
				.donate-btn:hover {
					background: var(--accent-magenta);
				}
				.donation-dialog {
					border: none;
					border-radius: 16px;
					padding: 0;
					max-width: 560px;
					width: calc(100% - 2rem);
					background: transparent;
				}
				.donation-dialog::backdrop {
					background: rgba(0, 0, 0, 0.5);
				}
				.donation-dialog__content {
					position: relative;
				}
				.donation-dialog__close {
					position: absolute;
					top: 0.75rem;
					right: 0.75rem;
					z-index: 1;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 2rem;
					height: 2rem;
					border: none;
					border-radius: 50%;
					background: transparent;
					color: var(--text-muted);
					font-size: 1.6rem;
					line-height: 1;
					cursor: pointer;
				}
				.donation-dialog__close:hover {
					color: var(--text);
				}
				.donation-dialog .donation-form {
					margin: 0;
				}
			`}
      </style>
    </>
  );
}
