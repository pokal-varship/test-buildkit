import SecondaryButton from "@components/buttons/secondaryButton";
import CustomButton from "@components/buttons/Button";

interface ComboCancelModalProps {
  onClose?: () => void;
  onYes?: () => void;
  onNo?: () => void;
  title?: string;
  yesButtonText?: string;
  noButtonText?: string;
}

const ComboCancelModal: React.FC<ComboCancelModalProps> = ({
  onYes,
  onNo,
  title = "Are you sure you want to cancel the meal customization?",
  yesButtonText = "Yes",
  noButtonText = "No",
}) => {
  return (
    <div className="dialog-container">
      <div className="modalContent">
        <h2 className="dialog-title text-left">{title}</h2>

        <div className="buttonRow">
          <SecondaryButton className="cancelBtn border-[var(--button-secondary-border-color)]" onClick={onYes}>
            {yesButtonText}
          </SecondaryButton>
          <CustomButton className="confirmBtn bg-[var(--button-primary-background)]" onClick={onNo}>
            {noButtonText}
          </CustomButton>
        </div>
      </div>

      <style>{`
        .dialog-container {
          padding: 0px;
          background-color: var(--cards-containers);
        }
        .modalContent {
          text-align: center;
          border-radius: 12px;
          padding: 20px;
        }
        .dialog-title {
          font-size: var(--heading-h2);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin-bottom: 35px;
        }
        .buttonRow {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .cancelBtn {
          flex: 1;
          color: var(--black);
          font-weight: var(--font-bold);
          height: 55px;
          transition: all 0.2s ease-in-out;
          font-size: var(--heading-h4);
        }
        .confirmBtn {
          flex: 1;
          font-weight: var(--font-bold);
          height: 55px;
          transition: all 0.2s ease-in-out;
          font-size: var(--heading-h4);
        }
        .cancelBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .confirmBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 768px) {
          .dialog-container {
            padding: 0px;
          }
          .modalContent {
            padding: 0
          }
          .dialog-title {
            font-size: var(--heading-h4);
            margin-bottom: 25px;
          }
          .cancelBtn {
            padding: 10px;
            font-size: var(--heading-h5);
          }
          .confirmBtn {
            font-size: var(--heading-h5);
          }
        }
      `}</style>
    </div>
  );
};

export default ComboCancelModal; 