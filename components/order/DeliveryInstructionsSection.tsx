"use client";

import useLang from "@hooks/useLang";
import { useToast } from "@components/toast/Toast";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LanguageCode, TranslationKeys } from "types";

const PHONE_OFF_ICON = "/images/icon/phone-off.svg";
const BELL_OFF_ICON = "/images/icon/bell-off.svg";
const MICROPHONE_ICON = "/images/icon/microphone.svg";

const MIN_RECORDING_MS = 400;

export type DeliveryInstructionOption = "avoidCalling" | "dontRingBell";

export interface DeliveryVoiceNote {
  blob: Blob;
  durationSec: number;
  previewUrl: string;
}

export interface DeliveryInstructionsSectionProps {
  selected: DeliveryInstructionOption[];
  onChange: (selected: DeliveryInstructionOption[]) => void;
  voiceNote: DeliveryVoiceNote | null;
  onVoiceNoteChange: (note: DeliveryVoiceNote | null) => void;
}

function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder !== "undefined") {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return "audio/webm";
    }
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    }
  }
  return "audio/webm";
}

const DeliveryInstructionsSection: React.FC<DeliveryInstructionsSectionProps> = ({
  selected,
  onChange,
  voiceNote,
  onVoiceNoteChange,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceNoteRef = useRef(voiceNote);
  voiceNoteRef.current = voiceNote;

  const stopMediaStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const revokeVoicePreview = useCallback((url?: string) => {
    const previewUrl = url ?? voiceNoteRef.current?.previewUrl;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopMediaStream();
      revokeVoicePreview();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [revokeVoicePreview, stopMediaStream]);

  const toggleOption = (option: DeliveryInstructionOption) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    onChange([...selected, option]);
  };

  const renderCheckbox = (checked: boolean) => (
    <div
      className={`delivery-instructions-checkbox w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        checked
          ? "delivery-instructions-checkbox-checked"
          : "delivery-instructions-checkbox-unchecked"
      }`}
      aria-hidden
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  const startRecording = async () => {
    if (isRecording || typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast("error", lang.microphoneNotSupported);
      }
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const durationMs = Date.now() - recordingStartedAtRef.current;
        stopMediaStream();

        if (durationMs < MIN_RECORDING_MS || chunksRef.current.length === 0) {
          toast("error", lang.recordingTooShort);
          setIsRecording(false);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        revokeVoicePreview();
        const previewUrl = URL.createObjectURL(blob);
        onVoiceNoteChange({
          blob,
          durationSec: Math.max(1, Math.round(durationMs / 1000)),
          previewUrl,
        });
        setIsRecording(false);
      };

      recorder.onerror = () => {
        stopMediaStream();
        setIsRecording(false);
        toast("error", lang.recordingFailed);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      stopMediaStream();
      setIsRecording(false);
      toast("error", lang.microphonePermissionDenied);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      return;
    }
    setIsRecording(false);
  };

  const handleRecordPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    void startRecording();
  };

  const handleRecordPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stopRecording();
  };

  const handlePlayVoiceNote = () => {
    if (!voiceNote?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(voiceNote.previewUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      audioRef.current.src = voiceNote.previewUrl;
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
      toast("error", lang.playbackFailed);
      setIsPlaying(false);
    });
  };

  const handleDeleteVoiceNote = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    revokeVoicePreview();
    onVoiceNoteChange(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const checkboxOptions: {
    id: DeliveryInstructionOption;
    icon: string;
    label: string;
    alt: string;
  }[] = [
    {
      id: "avoidCalling",
      icon: PHONE_OFF_ICON,
      label: lang.avoidCalling,
      alt: lang.avoidCalling,
    },
    {
      id: "dontRingBell",
      icon: BELL_OFF_ICON,
      label: lang.dontRingTheBell,
      alt: lang.dontRingTheBell,
    },
  ];

  return (
    <div className="delivery-instructions-container">
      <h4 className="delivery-instructions-title">{lang.deliveryInstructions}</h4>
      <div className="delivery-instructions-options">
        {checkboxOptions.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              className={`delivery-instructions-option ${checked ? "delivery-instructions-option-selected" : ""}`}
              onClick={() => toggleOption(option.id)}
            >
              <div className="delivery-instructions-option-header">
                <img
                  src={option.icon}
                  alt={option.alt}
                  width={19}
                  height={19}
                  className="delivery-instructions-option-icon"
                />
                {renderCheckbox(checked)}
              </div>
              <span className="delivery-instructions-option-label">{option.label}</span>
            </button>
          );
        })}

        <div
          role="button"
          tabIndex={0}
          aria-label={lang.record}
          className={`delivery-instructions-record-option ${
            isRecording ? "delivery-instructions-record-option-recording" : ""
          } ${voiceNote ? "delivery-instructions-record-option-has-audio" : ""}`}
          onPointerDown={voiceNote ? undefined : handleRecordPointerDown}
          onPointerUp={voiceNote ? undefined : handleRecordPointerUp}
          onPointerCancel={voiceNote ? undefined : handleRecordPointerUp}
          onKeyDown={(event) => {
            if (voiceNote) return;
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              void startRecording();
            }
          }}
          onKeyUp={(event) => {
            if (voiceNote) return;
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              stopRecording();
            }
          }}
        >
          <div className="delivery-instructions-record-header">
            <img
              src={MICROPHONE_ICON}
              alt=""
              width={11}
              height={15}
              className="delivery-instructions-record-icon"
              aria-hidden
            />
            <span className="delivery-instructions-record-label">
              {isRecording ? lang.recording : lang.record}
            </span>
          </div>

          {voiceNote ? (
            <div className="delivery-instructions-voice-actions">
              <button
                type="button"
                className="delivery-instructions-voice-play"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePlayVoiceNote();
                }}
              >
                {isPlaying ? lang.stopPlayback : lang.playRecording}
              </button>
              <span className="delivery-instructions-voice-duration">
                {formatDuration(voiceNote.durationSec)}
              </span>
              <button
                type="button"
                className="delivery-instructions-voice-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteVoiceNote();
                }}
              >
                {lang.deleteRecording}
              </button>
            </div>
          ) : (
            <span className="delivery-instructions-record-hint">
              {isRecording ? lang.releaseToStop : lang.tapHereAndHold}
            </span>
          )}
        </div>
      </div>
      <style>{`
        .delivery-instructions-container {
          background-color: var(--cards-containers);
          width: 100%;
          padding: 20px;
          border: 1px solid var(--borders-dividers);
          border-radius: 10px;
          margin-bottom: 18px;
        }
        .delivery-instructions-title {
          font-size: var(--heading-h4);
          color: var(--primary-text);
          font-weight: var(--font-bold);
          margin-bottom: 12px;
        }
        .delivery-instructions-options {
          display: flex;
          gap: 12px;
        }
        .delivery-instructions-option,
        .delivery-instructions-record-option {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          background-color: var(--cards-containers);
          text-align: left;
          touch-action: none;
          user-select: none;
        }
        .delivery-instructions-option {
          cursor: pointer;
        }
        .delivery-instructions-record-option {
          cursor: pointer;
          background-color: var(--tertiary-background);
        }
        .delivery-instructions-option-selected,
        .delivery-instructions-record-option-has-audio {
          border-color: var(--primary-color);
        }
        .delivery-instructions-record-option-recording {
          border-color: var(--primary-color);
          background-color: var(--success-opacity);
        }
        .delivery-instructions-option-header,
        .delivery-instructions-record-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .delivery-instructions-option-header {
          justify-content: space-between;
        }
        .delivery-instructions-option-icon,
        .delivery-instructions-record-icon {
          flex-shrink: 0;
        }
        .delivery-instructions-option-label {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--primary-text);
          line-height: 1.3;
        }
        .delivery-instructions-record-label {
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: #007aff;
          line-height: 1.2;
        }
        .delivery-instructions-record-hint {
          font-size: var(--small-font);
          font-weight: var(--font-regular);
          color: var(--secondary-text);
          line-height: 1.3;
        }
        .delivery-instructions-voice-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          width: 100%;
        }
        .delivery-instructions-voice-play,
        .delivery-instructions-voice-delete {
          font-size: var(--small-font);
          font-weight: var(--font-regular);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .delivery-instructions-voice-play {
          color: var(--primary-color);
        }
        .delivery-instructions-voice-delete {
          color: var(--accent-color);
        }
        .delivery-instructions-voice-duration {
          font-size: var(--small-font);
          color: var(--secondary-text);
        }
        .delivery-instructions-checkbox-unchecked {
          border-color: var(--borders-dividers);
          background-color: var(--cards-containers);
        }
        .delivery-instructions-checkbox-checked {
          border-color: var(--primary-color);
          background-color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .delivery-instructions-container {
            border-radius: 0;
            margin-bottom: 16px;
            padding: 16px 20px;
          }
          .delivery-instructions-title {
            font-size: var(--heading-h5);
          }
          .delivery-instructions-options {
            gap: 10px;
          }
          .delivery-instructions-option,
          .delivery-instructions-record-option {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export interface BuildDeliveryInstructionsOptions {
  voiceNoteUrl?: string | null;
  hasVoiceNote?: boolean;
}

export function buildDeliveryInstructionsText(
  selected: DeliveryInstructionOption[],
  lang: TranslationKeys,
  options?: BuildDeliveryInstructionsOptions
): string {
  const parts: string[] = [];
  if (selected.includes("avoidCalling")) {
    parts.push(lang.avoidCalling);
  }
  if (selected.includes("dontRingBell")) {
    parts.push(lang.dontRingTheBell);
  }
  if (options?.voiceNoteUrl) {
    parts.push(`${lang.voiceDeliveryInstruction}: ${options.voiceNoteUrl}`);
  } else if (options?.hasVoiceNote) {
    parts.push(lang.voiceDeliveryInstruction);
  }
  return parts.join(", ");
}

export default DeliveryInstructionsSection;
