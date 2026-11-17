import CustomButton from '@components/buttons/Button';
import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import React, { useState, useRef, useEffect } from 'react';
import { TranslationKeys, LanguageCode } from 'types';
import { useLang } from '@hooks/useLang';

const InstructionsModal: React.FC<{ onClose: () => void, handleInstructionSubmit: (instructions: string) => void, item: string }> = ({ onClose, handleInstructionSubmit, item }) => {
    const [instructions, setInstructions] = useState(item || '');
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleClose = () => {
        onClose();
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [instructions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInstructions(e.target.value);
        adjustTextareaHeight();
    };


    return (
        <div className="instructions-modal-container">
            <div className="instructions-modal-content">
                <div className="flex justify-between items-center">
                    <h2 className="instructions-modal-title">Add Instructions</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Icon
                            icon={`${CROSS_ICON}#cross`}
                            width={14}
                            height={14}
                            color={"var(--primary-text)"}
                            className="cursor-pointer cross-icon"
                            viewBox='0 0 16 16'
                            onClick={onClose}
                        />
                    </button>
                </div>

                <div className="px-0 py-4">
                    <textarea
                        ref={textareaRef}
                        className="instructions-modal-textarea w-full"
                        placeholder="Add special instructions here"
                        value={instructions}
                        onChange={handleInputChange}
                        maxLength={100}
                    />
                </div>

                <div className="flex justify-end">
                    <CustomButton
                        onClick={() => handleInstructionSubmit(instructions)}
                        className="instructions-modal-button"
                        disabled={instructions.length === 0}
                    >
                        {lang.confirm}
                    </CustomButton>
                </div>
            </div>
            <style>{`
                .instructions-modal-container{
                    width: 100%;
                    height: 100%;
                    background-color: var(--tertiary-background);
                    min-width: 500px;
                }
                .instructions-modal-content{
                    border-radius: 10px;
                    width: 100%;
                }
                .instructions-modal-title{
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .instructions-modal-textarea{
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--primary-text);
                    border: 1px solid var(--borders-dividers);
                    background-color: var(--cards-containers);
                    border-radius: 8px;
                    min-height: 90px;
                    height: auto;
                    max-height: 200px;
                    padding: 15px;
                    resize: none;
                    overflow-y: auto;
                }
                .instructions-modal-textarea:focus{
                    border: 1px solid var(--borders-dividers);
                }
                .instructions-modal-textarea:hover{
                    border: 1px solid var(--borders-dividers);
                }
                .instructions-modal-button{
                    min-width: 200px;
                    font-weight: var(--font-bold);
                }
                @media (max-width: 768px) {
                    .instructions-modal-container{
                        min-width: 300px;
                    }
                    .instructions-modal-button{
                        width: 100%;
                    }
                    .instructions-modal-title{
                        font-size: var(--heading-h4);
                        font-weight: var(--font-extra-bold);
                    }
                    .instructions-modal-textarea{
                        min-height: 90px;
                        height: auto;
                        max-height: 300px;
                    }
                }
            `}</style>
        </div>
    );
}

export default InstructionsModal;

