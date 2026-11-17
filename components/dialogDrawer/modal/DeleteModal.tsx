import SecondaryButton from "@components/buttons/secondaryButton";
import CustomButton from "@components/buttons/Button";

interface DeleteModalProps {
    onClose?: () => void;
    onYes?: () => void;
    onNo?: () => void;
    title?: string;
    description?: string;
    error?: string;
    message?: {
      items: string[];
    };
    yesButtonText?: string;
    noButtonText?: string;
    yesDisabled?: boolean;
  }
  
  const DeleteModal: React.FC<DeleteModalProps> = ({
    onYes,
    onNo,
    title,
    description,
    error,
    message,
    yesButtonText,
    noButtonText,
    yesDisabled = false,
  }) => {
    const items = Array.isArray(message?.items) ? message.items : [];

    return (
      <div className="delete-modal">
        {title ? <h2 className="delete-modal-title">{title}</h2> : null}

        {items.length > 0 ? (
          <div className="delete-modal-info">
            {description ? <strong className="delete-modal-info-text">{description}</strong> : null}
            <div className="delete-modal-items">
              {items.map((item, index) => (
                <p key={index} className="delete-modal-item">{item}</p>
              ))}
            </div>
          </div>
        ) : description ? (
          <p className="delete-modal-description">{description}</p>
        ) : null}

        {error ? <p className="delete-modal-error">{error}</p> : null}

        <div className="delete-modal-actions">
          <SecondaryButton className="delete-modal-btn" onClick={onNo} disabled={yesDisabled}>
            {noButtonText}
          </SecondaryButton>
          <CustomButton className="delete-modal-btn" onClick={onYes} disabled={yesDisabled}>
            {yesButtonText}
          </CustomButton>
        </div>

        <style>{`
          .delete-modal {
            background-color: var(--cards-containers);
            text-align: left;
          }
          .delete-modal-title {
            font-size: var(--heading-h3);
            font-weight: var(--font-bold);
            color: var(--primary-text);
            margin: 0 0 8px;
          }
          .delete-modal-description {
            margin: 0 0 20px;
            font-size: var(--description-font);
            font-weight: var(--font-regular);
            line-height: 1.5;
            color: var(--primary-text);
          }
          .delete-modal-error {
            margin: -8px 0 20px;
            font-size: var(--small-font);
            color: var(--error);
          }
          .delete-modal-info {
            background-color: var(--primary-background);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 20px;
          }
          .delete-modal-info-text {
            display: block;
            font-weight: var(--font-regular);
            margin-bottom: 5px;
            color: var(--primary-text);
          }
          .delete-modal-item {
            margin: 0;
            font-size: var(--small-font);
            color: var(--primary-text);
          }
          .delete-modal-actions {
            display: flex;
            gap: 12px;
          }
          .delete-modal-btn {
            flex: 1;
            font-weight: var(--font-bold);
          }
          @media (max-width: 768px) {
            .delete-modal-title {
              font-size: var(--heading-h4);
            }
            .delete-modal-info-text {
              font-size: var(--description-font);
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default DeleteModal;
  