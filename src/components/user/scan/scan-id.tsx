"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useRef, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScanLine, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getTodayAttendance,
  recordTimeIn,
  recordTimeOut,
} from "@/actions/attendance";
import { authClient } from "@/lib/auth-client";

const NFC_UID_LENGTH = 10;
const ACCIDENTAL_INPUT_CLEAR_DELAY = 1000;
const DIALOG_SUCCESS_DURATION = 3000;
const DIALOG_ERROR_DURATION = 2500;
const DIALOG_WARNING_DURATION = 2000;

export function ScanId({ className, ...props }: React.ComponentProps<"div">) {
  const { data: session } = authClient.useSession();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("timein");
  const timeInInputRef = useRef<HTMLInputElement>(null);
  const timeOutInputRef = useRef<HTMLInputElement>(null);

  const [isScanResultDialogOpen, setIsScanResultDialogOpen] = useState(false);
  const [scanResultInfo, setScanResultInfo] = useState<{
    title: string;
    description: React.ReactNode;
    type: "success" | "error" | "warning";
    icon?: React.ElementType;
  } | null>(null);
  const autoCloseDialogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearAccidentalInputTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getActiveInputRef = useCallback(() => {
    return activeTab === "timein" ? timeInInputRef : timeOutInputRef;
  }, [activeTab]);

  useEffect(() => {
    const updateTimeDate = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          weekday: "short",
        }),
      );
    };
    updateTimeDate();
    const timerId = setInterval(updateTimeDate, 1000);
    return () => clearInterval(timerId);
  }, []);

  const focusActiveInput = useCallback(() => {
    const activeInput = getActiveInputRef().current;
    if (
      activeInput &&
      document.activeElement !== activeInput &&
      !isScanResultDialogOpen
    ) {
      activeInput.focus({ preventScroll: true });
    }
  }, [getActiveInputRef, isScanResultDialogOpen]);

  useEffect(() => {
    if (!isScanResultDialogOpen) {
      const timer = setTimeout(focusActiveInput, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isScanResultDialogOpen, focusActiveInput]);

  const openDialogWithInfo = (
    title: string,
    description: React.ReactNode,
    type: "success" | "error" | "warning",
    icon: React.ElementType,
    duration: number,
  ) => {
    if (autoCloseDialogTimerRef.current)
      clearTimeout(autoCloseDialogTimerRef.current);
    setScanResultInfo({ title, description, type, icon });
    setIsScanResultDialogOpen(true);
    autoCloseDialogTimerRef.current = setTimeout(
      () => setIsScanResultDialogOpen(false),
      duration,
    );
  };

  const handleScan = async (
    scannedValue: string,
    scanType: "Time In" | "Time Out",
  ) => {
    const userId = session?.user.id;

    try {
      if (!scannedValue || !userId) {
        openDialogWithInfo(
          "Invalid Scan",
          "Missing required information",
          "error",
          XCircle,
          DIALOG_ERROR_DURATION,
        );
        return;
      }

      const statusResult = await getTodayAttendance(userId, scannedValue);
      if ("error" in statusResult) throw new Error(statusResult.error);

      const { studentName, studentId, timeIn, timeOut } = statusResult.data;
      const timeMap = {
        "Time In": timeIn,
        "Time Out": timeOut,
      };

      if (timeMap[scanType]) {
        throw new Error(
          `Student Name: ${studentName}\n` +
            `Student ID: ${studentId}\n` +
            `Status: Already ${scanType === "Time In" ? "checked in" : "checked out"} at ${timeMap[
              scanType
            ]?.toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })}`,
        );
      }

      const action = scanType === "Time In" ? recordTimeIn : recordTimeOut;
      const result = await action(userId, scannedValue);
      if ("error" in result) throw new Error(result.error);

      const timestamp =
        scanType === "Time In"
          ? (result as { timeIn: Date }).timeIn
          : (result as { timeOut: Date }).timeOut;

      const localTime = timestamp.toLocaleTimeString([], {
        hour: "numeric",
        minute: "numeric",
      });
      const localDate = timestamp.toLocaleDateString();

      const descriptionContent = (
        <div className="flex flex-col space-y-1">
          <span>
            <strong>Student Name:</strong> {result.studentName}
          </span>
          <span>
            <strong>Student ID:</strong> {result.studentId}
          </span>
          <span>
            <strong>Time:</strong> {localTime}
          </span>
          <span>
            <strong>Date:</strong> {localDate}
          </span>
        </div>
      );

      openDialogWithInfo(
        `${scanType} Successful!`,
        descriptionContent,
        "success",
        CheckCircle,
        DIALOG_SUCCESS_DURATION,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      const formattedMessage = (
        <div className="whitespace-pre-wrap">{message}</div>
      );
      openDialogWithInfo(
        "Operation Failed",
        formattedMessage,
        "error",
        XCircle,
        DIALOG_ERROR_DURATION,
      );
    }
  };

  const handleInvalidScanOnEnter = () => {
    openDialogWithInfo(
      "Invalid Scan",
      "Please ensure the ID is scanned correctly.",
      "error",
      XCircle,
      DIALOG_ERROR_DURATION,
    );
  };

  const handleAccidentalInputCleared = () => {
    openDialogWithInfo(
      "Scan Interrupted",
      "Ready for next scan.",
      "warning",
      AlertTriangle,
      DIALOG_WARNING_DURATION,
    );
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    scanType: "Time In" | "Time Out",
  ) => {
    const inputEl = event.currentTarget;
    if (clearAccidentalInputTimerRef.current) {
      clearTimeout(clearAccidentalInputTimerRef.current);
      clearAccidentalInputTimerRef.current = null;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const scannedValue = inputEl.value.trim();
      const isValidNfcUid =
        scannedValue.length === NFC_UID_LENGTH && /^\d+$/.test(scannedValue);

      const processScan = () => {
        if (isValidNfcUid) {
          handleScan(scannedValue, scanType);
        } else if (scannedValue) {
          handleInvalidScanOnEnter();
        }
        inputEl.value = "";
      };

      if (isScanResultDialogOpen) {
        setIsScanResultDialogOpen(false);
        if (autoCloseDialogTimerRef.current)
          clearTimeout(autoCloseDialogTimerRef.current);
        setTimeout(processScan, 100);
      } else {
        processScan();
      }
      return;
    }

    clearAccidentalInputTimerRef.current = setTimeout(() => {
      if (inputEl.value.trim() && document.activeElement === inputEl) {
        handleAccidentalInputCleared();
        inputEl.value = "";
      }
    }, ACCIDENTAL_INPUT_CLEAR_DELAY);
  };

  const inputBlurHandler = useCallback(() => {
    if (clearAccidentalInputTimerRef.current) {
      clearTimeout(clearAccidentalInputTimerRef.current);
      clearAccidentalInputTimerRef.current = null;
    }
    setTimeout(() => {
      if (
        isScanResultDialogOpen ||
        document.activeElement?.getAttribute("role") === "dialog"
      )
        return;
      const activeInput = getActiveInputRef().current;
      if (
        activeInput &&
        document.activeElement !== activeInput &&
        document.activeElement?.getAttribute("role") !== "tab"
      ) {
        focusActiveInput();
      }
    }, 0);
  }, [isScanResultDialogOpen, getActiveInputRef, focusActiveInput]);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (!isScanResultDialogOpen) setTimeout(focusActiveInput, 0);
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [isScanResultDialogOpen, focusActiveInput]);

  const handleDialogOnOpenChange = (open: boolean) => {
    setIsScanResultDialogOpen(open);
    if (!open && autoCloseDialogTimerRef.current) {
      clearTimeout(autoCloseDialogTimerRef.current);
      autoCloseDialogTimerRef.current = null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 sm:gap-8",
        className,
      )}
      {...props}
    >
      <header className="text-center">
        <h1 className="mb-2 text-2xl font-bold sm:text-4xl">Attendance</h1>
      </header>

      <Card className="flex w-full max-w-md flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold sm:text-2xl">
            Tap to Scan
          </CardTitle>
          <CardDescription>
            Scan your ID to record your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <p className="text-lg font-semibold">{currentTime}</p>
            <p className="text-muted-foreground text-sm font-semibold">
              {currentDate}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(newTab) => {
              if (clearAccidentalInputTimerRef.current)
                clearTimeout(clearAccidentalInputTimerRef.current);
              const curr = getActiveInputRef().current;
              if (curr) curr.value = "";
              setActiveTab(newTab);
            }}
            className="w-full"
          >
            <div className="flex w-full flex-col items-center justify-center gap-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timein">Time In</TabsTrigger>
                <TabsTrigger value="timeout">Time Out</TabsTrigger>
              </TabsList>
              <p className="text-muted-foreground text-sm font-semibold">
                Select an option
              </p>
            </div>

            <TabsContent value="timein" className="relative mt-4">
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <ScanLine className="text-primary mx-auto h-16 w-16" />
                <p>Please tap your ID to time in</p>
              </div>
              <Input
                ref={timeInInputRef}
                id="nfcIdTimeIn"
                type="text"
                inputMode="numeric"
                aria-label="NFC Time In Input"
                onKeyDown={(e) => handleInputKeyDown(e, "Time In")}
                onBlur={inputBlurHandler}
                className="pointer-events-none sr-only focus:outline-none"
                autoComplete="off"
              />
            </TabsContent>
            <TabsContent value="timeout" className="relative mt-4">
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <ScanLine className="text-primary mx-auto h-16 w-16" />
                <p>Please tap your ID to time out</p>
              </div>
              <Input
                ref={timeOutInputRef}
                id="nfcIdTimeOut"
                type="text"
                inputMode="numeric"
                aria-label="NFC Time Out Input"
                onKeyDown={(e) => handleInputKeyDown(e, "Time Out")}
                onBlur={inputBlurHandler}
                className="pointer-events-none sr-only focus:outline-none"
                autoComplete="off"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-muted-foreground mt-auto flex items-center justify-center text-sm">
          <p>Waiting for NFC scan...</p>
        </CardFooter>
      </Card>

      <Dialog
        open={isScanResultDialogOpen}
        onOpenChange={handleDialogOnOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          {scanResultInfo && (
            <DialogHeader className="items-center text-center">
              {scanResultInfo.icon && (
                <scanResultInfo.icon
                  className={cn(
                    "mb-2 h-12 w-12",
                    scanResultInfo.type === "success" && "text-green-500",
                    scanResultInfo.type === "error" && "text-red-500",
                    scanResultInfo.type === "warning" && "text-yellow-500",
                  )}
                />
              )}
              <DialogTitle
                className={cn(
                  "text-xl font-semibold",
                  scanResultInfo.type === "success" && "text-green-600",
                  scanResultInfo.type === "error" && "text-red-600",
                  scanResultInfo.type === "warning" && "text-yellow-600",
                )}
              >
                {scanResultInfo.title}
              </DialogTitle>
              {scanResultInfo.description && (
                <div className="text-muted-foreground text-sm">
                  {scanResultInfo.description}
                </div>
              )}
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
