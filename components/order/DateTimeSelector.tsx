"use client";
import { useState, useEffect } from "react";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  LocalizationProvider,
  MobileDatePicker,
  TimeClock,
  TimeField,
} from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { useTheme } from "context/ThemeProvider";
import { useToast } from "@components/toast/Toast";

interface DateTimeSelectorProps {
  handleScheduleOrder: (time: string) => void;
}

const bufferTime = 30; // minutes
const START_HOUR = 8;
const END_HOUR = 22;

const DateTimeSelector = ({ handleScheduleOrder }: DateTimeSelectorProps) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { theme } = useTheme();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [selectedTime, setSelectedTime] = useState<Moment>(moment());
  const [originalTime, setOriginalTime] = useState<Moment>(moment());
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<"clock" | "text">("clock");
  const [open, setOpen] = useState(false);

  // Get buffered time (now + 30min)
  const getBufferedTime = () => {
    const now = moment();
    const buffered = now.add(bufferTime, "minutes");
    return buffered.seconds(0);
  };

  useEffect(() => {
    const earliest = moment().hour(START_HOUR).minute(0).seconds(0);
    const buffered = getBufferedTime();
    const defaultTime = buffered.isBefore(earliest)
      ? earliest
      : buffered.clone();
    setSelectedTime(defaultTime);
    setOriginalTime(defaultTime.clone());
  }, []);

  useEffect(() => {
    const buffered = getBufferedTime();
    const isASAP = selectedTime.isSame(buffered, "minute");
    const datetime = isASAP
      ? `ASAP (about ${selectedTime.format("HH:mm")})`
      : `${selectedDate.format("YYYY-MM-DD")} ${selectedTime.format("HH:mm")}`;
    handleScheduleOrder(datetime);
  }, [selectedDate, selectedTime]);

  const shouldDisableDate = (date: Moment): boolean => {
    const today = moment().startOf("day");
    return date.isBefore(today);
  };

  const isValidTime = (time: Moment) => {
    const isToday = selectedDate.isSame(moment(), "day");
    const start = moment(selectedDate).hour(START_HOUR).minute(0).seconds(0);
    const end = moment(selectedDate).hour(END_HOUR).minute(0).seconds(0);
    const bufferCutoff = getBufferedTime();

    // Must be within 8 AM–10 PM
    if (time.isBefore(start) || time.isAfter(end)) return false;

    // If today, enforce buffer
    if (isToday && time.isBefore(bufferCutoff)) return false;

    return true;
  };

  // ✅ Don't validate here — just store the selection
  const handleClockTimeChange = (newTime: Moment | null) => {
    if (!newTime) return;
    const proposed = moment(selectedDate)
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(0);

    setSelectedTime(proposed);
  };

  const handleOk = () => {
    if (!isValidTime(selectedTime)) {
      toast(
        "error",
        `The store is not online at this time. Please select a time between ${moment()
          .hour(START_HOUR)
          .minute(0)
          .format("hh:mm A")} and ${moment()
          .hour(END_HOUR)
          .minute(0)
          .format("hh:mm A")}.`
      );
      setSelectedTime(originalTime.clone());
    }

    setTimeDialogOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="date-time-selector">
        <div className="date-selector">
          <label className="selector-label">{lang.date || "Date"}</label>
          <MobileDatePicker
            value={selectedDate}
            onChange={(newDate: Moment | null) => {
              if (newDate && !newDate.isBefore(moment().startOf("day"))) {
                setSelectedDate(newDate);
              } else {
                setSelectedDate(moment().startOf("day"));
              }
            }}
            format="DD/MM/YYYY"
            shouldDisableDate={shouldDisableDate}
            minDate={moment().startOf("day")}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
                InputProps: {
                  className: "date-input",
                  onClick: () => setOpen(true),
                },
              },
              actionBar: {
                actions: ["clear", "accept"],
              },
            }}
            open={open}
            onClose={() => setOpen(false)}
          />
        </div>

        <div className="time-selector">
          <label className="selector-label">{lang.time || "Time"}</label>
          <div
            className="time-input-container"
            onClick={() => {
              setOriginalTime(selectedTime.clone());
              setTimeDialogOpen(true);
            }}
          >
            <div className="time-display">
              {selectedTime.isSame(getBufferedTime(), "minute")
                ? `ASAP (about ${selectedTime.format("h:mm A")})`
                : selectedTime.format("h:mm A")}
            </div>
            <AccessTimeIcon className="time-icon" />
          </div>
        </div>

        <Dialog
          open={timeDialogOpen}
          onClose={() => setTimeDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <div className="dialog-header">
            <button
              className={`view-toggle-btn ${
                viewType === "clock" ? "active" : ""
              }`}
              onClick={() => setViewType("clock")}
            >
              Clock
            </button>
            <button
              className={`view-toggle-btn ${
                viewType === "text" ? "active" : ""
              }`}
              onClick={() => setViewType("text")}
            >
              Text
            </button>
          </div>

          <DialogContent>
            {viewType === "clock" ? (
              <div className="clock-container">
                <TimeClock
                  value={selectedTime}
                  onChange={handleClockTimeChange}
                  ampm
                  ampmInClock
                  minutesStep={5}
                />
              </div>
            ) : (
              <div className="text-input-container">
                <TimeField
                  value={selectedTime}
                  onChange={handleClockTimeChange}
                  format="hh:mm a"
                  ampm
                  fullWidth
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      InputProps: {
                        className: "time-text-input",
                      },
                    },
                  }}
                />
              </div>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setSelectedTime(originalTime.clone());
                setTimeDialogOpen(false);
              }}
              sx={{
                color: "var(--primary-text) !important",
              }}
            >
              {lang.cancel}
            </Button>
            <Button onClick={handleOk} color="primary" variant="contained">
              {lang.ok}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <style>{`
        .date-time-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
          border-top: 1px solid var(--border-color, #e0e0e0);
          padding-top: 16px;
        }

        .selector-label {
          margin-bottom: 8px;
          color: var(--secondary-text);
          font-size: var(--small-font);
        }

        .date-input {
          background-color: var(--primary-background);
          color: var(--primary-text);
          border-radius: 8px;
          height: 48px;
        }

        .MuiPickersOutlinedInput-notchedOutline {
          border-color: var(--borders-dividers) !important;
        }

        .time-input-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          height: 48px;
          background-color: var(--primary-background);
          border: 1px solid var(--borders-dividers);
        }

        .time-display {
          color: var(--primary-text);
        }

        .time-icon {
          color: var(--primary-text);
        }

        .dialog-header {
          display: flex;
          padding: 16px 16px 0;
        }

        .view-toggle-btn {
          flex: 1;
          padding: 8px;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: var(--small-font);
          opacity: 0.7;
          color: var(--secondary-text);
        }

        .view-toggle-btn.active {
          border-bottom: 2px solid #f50057;
          opacity: 1;
          font-weight: bold;
          color: var(--primary-text);
        }

        .clock-container {
          display: flex;
          justify-content: center;
          padding: 16px 0;
        }

        .text-input-container {
          padding: 24px 16px;
        }

        .time-text-input {
          background-color: ${theme === "light"
            ? "var(--secondary-background)"
            : "var(--primary-background)"};
          color: var(--primary-text);
          border-radius: 8px;
          border: 1px solid var(--primary-color);
        }
        .time-text-input:focus {
          border: 1px solid var(--primary-color);
        }

        //clock
        .MuiClockPointer-root {
          background-color: var(--primary-color) !important;
        }
        .MuiClock-pin {
          background-color: var(--primary-color) !important;
        }
        .MuiClockPointer-thumb {
          background-color: var(--primary-color) !important;
          border: 16px solid var(--primary-color) !important;
        }
        .MuiClockNumber-root.Mui-selected {
          color: var(--primary-text) !important;
        }
        .MuiDialogActions-root > :not(style ~ :not(style)) {
          background-color: var(--primary-color) !important;
          color: var(--black) !important;
        }

        .MuiSvgIcon-root {
          color: var(--primary-text) !important;
          width: 24px !important;
          height: 24px !important;
        }
        .MuiDialog-paper {
          background-color: ${theme === "light"
            ? "var(--secondary-background)"
            : "var(--primary-background)"};
        }
        .MuiClock-squareMask {
          background-color: var(--white) !important;
          border-radius: 50% !important;
        }
        .MuiPaper-root-MuiDialog-paper {
          background-color: ${theme === "light"
            ? "var(--secondary-background)"
            : "var(--primary-background)"};
        }

        }
        .MuiTypography-root {
          color: var(--primary-text) !important;
        }

        .MuiYearCalendar-button {
          color: var(--primary-text) !important;
        }

        [class*="MuiClock-amButton"]:not(.Mui-selected) {
          color: var(--primary-text) !important;
        }

        [class*="MuiClock-pmButton"]:not(.Mui-selected) {
          color: var(--primary-text) !important;
        }

        [class*="MuiClock-amButton"].Mui-selected {
           background-color: var(--primary-color) !important;
           color: var(--primary-text) !important;
        }

        [class*="MuiClock-pmButton"].Mui-selected {
          background-color: var(--primary-color) !important;
          color: var(--primary-text) !important;
        }

        //date
        .MuiPickersCalendarHeader-label {
          color: var(--primary-text) !important;
        }
        .MuiPickersDay-root {
          color: var(--primary-text) !important;
        }
        .MuiPickersDay-root.Mui-selected {
          color: var(--white) !important;
          background-color: var(--primary-color) !important;
          border-radius: 50% !important;
        }
        .MuiDayCalendar-weekDayLabel {
          color: var(--primary-text) !important;
        }
        .MuiDatePickerToolbar-title {
          color: var(--primary-text) !important;
          font-size: 1.5rem !important;
        }
        .MuiPickersToolbar-root {
          background-color: ${theme === "light"
            ? "var(--secondary-background)"
            : "var(--primary-background)"} !important;
        }
        .MuiPickersToolbar-content {
          background-color: ${theme === "light"
            ? "var(--secondary-background)"
            : "var(--primary-background)"} !important;
        }
        .MuiPickersDay-root.Mui-disabled:not(.Mui-selected) {
          color: var(--primary-text) !important;
          opacity: 0.5 !important;
        }
        .MuiButton-root {
          color: var(--primary-text) !important;
        }
        .MuiPickersActionBar-root .MuiButton-root:first-of-type {
          color: var(--accent-color) !important;
          text-transform: uppercase !important;
        }
        .MuiPickersActionBar-root .MuiButton-root:last-of-type {
          background-color: var(--primary-color) !important;
          color: var(--black) !important;
          text-transform: uppercase !important;
        }
        .MuiPickersActionBar-root .MuiButton-root:last-of-type:hover {
          background-color: var(--cta-hover) !important;
        }

        .MuiTypography-root {
          color: var(--primary-text) !important;
        }

        @media (max-width: 768px) {
          .date-time-selector {
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: unset !important;
          }
        }
      `}</style>
    </LocalizationProvider>
  );
};

export default DateTimeSelector;
