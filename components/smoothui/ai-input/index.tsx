"use client";

import { Button } from "@/components/ui/button";
import {Pause } from "lucide-react";

// import {SiriOrb} from "../siri-orb";
function cn(
  ...inputs: (string | Record<string, boolean> | undefined | null)[]
) {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ")
    .trim();
}
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import SiriOrb from "../siri-orb";
import { useClickOutside } from "./use-click-outside";
import { X } from "lucide-react";

const SPEED = 1;
const SUCCESS_DURATION = 1500;
const DOCK_HEIGHT = 44;
const FEEDBACK_BORDER_RADIUS = 14;
const DOCK_BORDER_RADIUS = 20;
const SPRING_STIFFNESS = 550;
const SPRING_DAMPING = 45;
const SPRING_MASS = 0.7;
const CLOSE_DELAY = 0.08;

type FooterContext = {
  showFeedback: boolean;
  success: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
};

const FooterContext = React.createContext({} as FooterContext);
const useFooter = () => React.useContext(FooterContext);

export function MorphSurface() {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const feedbackRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const closeFeedback = React.useCallback(() => {
    setShowFeedback(false);
    feedbackRef.current?.blur();
  }, []);

  const openFeedback = React.useCallback(() => {
    setShowFeedback(true);
    setTimeout(() => {
      feedbackRef.current?.focus();
    });
  }, []);

  const onFeedbackSuccess = React.useCallback(() => {
    closeFeedback();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, SUCCESS_DURATION);
  }, [closeFeedback]);

  useClickOutside(rootRef, closeFeedback);

  const context = React.useMemo(
    () => ({
      showFeedback,
      success,
      openFeedback,
      closeFeedback,
    }),
    [showFeedback, success, openFeedback, closeFeedback]
  );

  return (
    <div
      className={cn("flex items-center justify-center", {
        "fixed inset-0 z-50": showFeedback,
      })}
    >
      <motion.div
        animate={{
          width: showFeedback ? "100vw" : "auto",
          height: showFeedback ? "100vh" : DOCK_HEIGHT,
          borderRadius: showFeedback
            ? FEEDBACK_BORDER_RADIUS
            : DOCK_BORDER_RADIUS,
        }}
        className={cn(
          "relative bottom z-50 flex flex-col items-center overflow-hidden border bg-background max-sm:bottom"
        )}
        data-footer
        initial={false}
        ref={rootRef}
        transition={{
          type: "spring",
          stiffness: SPRING_STIFFNESS / SPEED,
          damping: SPRING_DAMPING,
          mass: SPRING_MASS,
          delay: showFeedback ? 0 : CLOSE_DELAY,
        }}
      >
        <FooterContext.Provider value={context}>
          <Dock />
          <Feedback onSuccess={onFeedbackSuccess} ref={feedbackRef} />
        </FooterContext.Provider>
      </motion.div>
    </div>
  );
}

function Dock() {
  const { showFeedback, openFeedback } = useFooter();
  return (
    <footer className="mt-auto flex h-[44px] select-none items-center justify-center whitespace-nowrap">
      <div className="flex items-center justify-center gap-2 px-3 max-sm:h-10 max-sm:px-2">
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showFeedback ? (
              <motion.div
                animate={{ opacity: 0 }}
                className="h-5 w-5"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="placeholder"
              />
            ) : (
              <motion.div
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="siri-orb"
                transition={{ duration: 0.2 }}
              >
                <SiriOrb
                  colors={{
                    bg: "oklch(22.64% 0 0)",
                  }}
                  size="24px"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          className="flex h-fit flex-1 justify-end rounded-full px-2 py-0.5!"
          onClick={openFeedback}
          type="button"
          variant="ghost"
        >
          <span className="truncate">Ask AI</span>
        </Button>
      </div>
    </footer>
  );
}

// Using viewport units for fullscreen when feedback is open

function Feedback({
  ref,
  onSuccess,
}: {
  ref: React.Ref<HTMLTextAreaElement>;
  onSuccess: () => void;
}) {
  const { closeFeedback, showFeedback } = useFooter();
  const [paused, setPaused] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSuccess();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      closeFeedback();
    }
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      className="absolute bottom-0"
      onSubmit={onSubmit}
      style={{
        width: showFeedback ? "100vw" : 0,
        height: showFeedback ? "100vh" : 0,
        pointerEvents: showFeedback ? "all" : "none",
      }}
    >
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex h-full flex-col p-1"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: SPRING_STIFFNESS / SPEED,
              damping: SPRING_DAMPING,
              mass: SPRING_MASS,
            }}
          >
            <div className="flex justify-between py-1">
              <p className="z-2 ml-[38px] flex select-none items-center gap-[6px] text-foreground">
                {/* AI Input */}
              </p>
              <button
                type="button"
                onClick={closeFeedback}
                className="-translate-y-[3px] right-4 mt-1 flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-md bg-transparent text-center text-foreground hover:bg-primary/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border h-full w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <SiriOrb paused={paused} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaused(true)}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute top-2 left-3"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SiriOrb
              colors={{
                bg: "oklch(22.64% 0 0)",
              }}
              size="24px"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// Add default export for lazy loading
export default MorphSurface;
