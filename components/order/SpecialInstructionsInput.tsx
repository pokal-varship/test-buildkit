'use client';

import Icon from '@components/image/Icons';
import { CLOSE_CIRCLE_ICON, INSTRUCTION_ICON } from '@config/Header/image.config';
import { open_dialog } from '@lib/modalHandler';
import React from 'react';
import { CartItem } from './order.type';

interface Props {
  itemId: string;
  initialValue?: string;
  placeholder: string;
  onSubmit: (customType: string, itemId: string, value: string) => void;
  item: CartItem;
}

const SpecialInstructionsInput: React.FC<Props> = ({ itemId, onSubmit, item }) => {
  const handleInstructionSubmit = (instructions: string) => {
    onSubmit("UPDATE_SPECIAL_INSTRUCTIONS", itemId, instructions);
  }

  const handleRemoveInstruction = () => {
    onSubmit("UPDATE_SPECIAL_INSTRUCTIONS", itemId, "");
  }

  const handleInstructionModal = () => {
    open_dialog("instructions", {
      open: true,
      propsData: {
        handleInstructionSubmit: handleInstructionSubmit,
        item: item?.specialInstructions,
      },
      type: "instructions",
      handlerDialog: () => { },
      handleClose: () => { },
      anchor: 'bottom',
      onlyDialog: false,
      className: 'instructions-modal',
      dialogPosition: 'bottom',
      sxStyle: {
        '& .MuiPaper-root': {
          width: '100%',
        },
        '& .MuiDialogContent-root': {  
          backgroundColor: 'var(--tertiary-background) !important' },
      },
    });
  }

  const hasInstructions =
    !!item?.specialInstructions && item.specialInstructions.trim() !== "";

  return (
    <>
      <div className={`instruction-container inline-flex items-center gap-2 shadow-sm ${hasInstructions ? "instruction-container--active" : "instruction-container--empty"}`}>
        <div className="instruction-clickable">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleInstructionModal}>
            <Icon
              icon={`${INSTRUCTION_ICON}#instruction`}
              width={22}
              height={22}
              color={"var(--primary-text)"}
              viewBox="0 0 22 22"
            />
            <span className="instruction-text">Instructions</span>
          </div>
        </div>
        {hasInstructions && <Icon
          icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
          width={20}
          height={20}
          color={"var(--primary-text)"}
          className="cursor-pointer instruction-icon-desktop"
          viewBox="0 0 25 25"
          onClick={handleRemoveInstruction}
        />}
      </div>


        {/* Mobile */}
      <div className="mobile-instruction-container">
        <div
          className={`mobile-instruction-circle ${hasInstructions ? "mobile-instruction-circle--active" : ""}`}
          onClick={handleInstructionModal}
          style={{
            border: item?.specialInstructions && item?.specialInstructions?.trim?.() !== '' 
              ? '1px solid var(--primary-color)' 
              : '1px solid var(--borders-dividers)'
          }}
        >
          <Icon
            icon={`${INSTRUCTION_ICON}#instruction`}
            width={18}
            height={18}
            color={"var(--primary-text)"}
            viewBox="0 0 22 22"
          />
          {hasInstructions && (
            <div className="mobile-instruction-badge" onClick={(e) => {
              e.stopPropagation();
              handleRemoveInstruction();
            }}>
              <Icon
                icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
                width={18}
                height={18}
                color={"var(--primary-text)"}
                viewBox="0 0 25 25"
              />
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
        .instructions-modal {
          padding: 20px 16px;
          background-color: var(--tertiary-background)!important;
        }
        }
        .instruction-container{
            border-radius: 40px;
            padding: 6px 10px;
        }
        .instruction-container--empty {
            border: 1px solid var(--secondary-text);
            background-color: var(--cards-containers);
        }
        .instruction-container--active {
            border: 1.5px solid var(--borders-dividers);
            background-color: var(--primary-background);
        }
        .instruction-text{
            font-size: var(--description-font);
            font-weight: var(--font-regular);
            color: var(--primary-text);
        }
        .instruction-icon{
          display: none;
        }
        .instruction-clickable{
          display: block;
        }
        .instruction-icon-desktop{
          display: block;
        }
        .instruction-icon-mobile{
          display: none;
        }
        .mobile-instruction-container {
          display: none;
        }
        @media (max-width: 768px) {
          .instruction-container{
            border: none;
            margin-top: 10px;
            padding: 0px 0px;
          }
          .instruction-icon{
            display: block;
          }
          .instruction-clickable{
            display: none;
          }
          .instruction-icon-desktop{
            display: none;
          }
          .instruction-icon-mobile{
            display: block;
            position: relative;
            left: 10px;
          }
        .mobile-instruction-container {
          position: relative;
          display: inline-flex;
          margin-top: 8px;
          display: block;
        }
        
        .mobile-instruction-circle {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: var(--cards-containers);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .mobile-instruction-circle--active {
          border: 1px solid var(--primary-color);
        }
        
        .mobile-instruction-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          border-radius: 50%;
          // background-color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
        }
        }
      `}</style>
    </>
  );

};

export default SpecialInstructionsInput;
