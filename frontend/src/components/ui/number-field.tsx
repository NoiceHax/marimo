/* Copyright 2026 Marimo. All rights reserved. */
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Button,
  type ButtonProps,
  Input as RACInput,
  useLocale,
} from "react-aria-components";
import { cn } from "@/utils/cn";
import { maxFractionalDigits } from "@/utils/numbers";

export interface NumberFieldProps extends AriaNumberFieldProps {
  placeholder?: string;
  variant?: "default" | "xs";
  /**
   * Fires on every keystroke with the raw text currently in the input.
   * React-aria's `onChange` only fires on commit (blur/Enter/stepper); use this
   * when callers need to peek at the in-progress value, e.g. to enable an Apply
   * button while the user is still typing.
   */
  onInputText?: (text: string) => void;
  /**
   * Fires when the user steps the value with the stepper buttons or the
   * arrow/page keys.
   *
   * React-aria treats `step` as a constraint on the value and snaps everything
   * onto the `minValue + n * step` grid, both for display and on commit.
   * Passing `onStep` opts out of that: `step` is kept away from react-aria so
   * typed values keep their exact precision, and the caller applies its own
   * increment instead. Scroll-wheel stepping is disabled in this mode, since
   * react-aria owns the (non-passive) wheel listener.
   */
  onStep?: (direction: 1 | -1) => void;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      placeholder,
      variant = "default",
      onInputText,
      onStep,
      formatOptions,
      ...props
    },
    ref,
  ) => {
    const { locale } = useLocale();
    // Detaching the stepper buttons from react-aria (see `onStep`) also drops
    // the labels it generates for them, so rebuild them the same way.
    const fieldLabel = props["aria-label"] ?? "";

    // React-aria's spin button claims these keys, and since `step` is hidden
    // from it (see `onStep`) it would move the value by 1. Its handler is
    // merged in ahead of ours, so the capture phase is the only place we can
    // claim the key first. The guards mirror the ones react-aria applies.
    const handleStepKeys = onStep
      ? (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey ||
            e.altKey ||
            e.nativeEvent.isComposing ||
            props.isDisabled ||
            props.isReadOnly
          ) {
            return;
          }
          switch (e.key) {
            case "ArrowUp":
            case "PageUp":
              onStep(1);
              break;
            case "ArrowDown":
            case "PageDown":
              onStep(-1);
              break;
            case "Home":
              if (props.minValue == null) {
                return;
              }
              props.onChange?.(props.minValue);
              break;
            case "End":
              if (props.maxValue == null) {
                return;
              }
              props.onChange?.(props.maxValue);
              break;
            default:
              return;
          }
          e.preventDefault();
          e.stopPropagation();
        }
      : undefined;

    return (
      <AriaNumberField
        {...props}
        // See `onStep`.
        step={onStep ? undefined : props.step}
        isWheelDisabled={onStep ? true : props.isWheelDisabled}
        formatOptions={{
          minimumFractionDigits: 0,
          maximumFractionDigits: maxFractionalDigits(locale),
          ...formatOptions,
        }}
      >
        <div
          className={cn(
            "shadow-xs-solid hover:shadow-sm-solid hover:focus-within:shadow-md-solid",
            "flex overflow-hidden rounded-sm border border-input bg-background text-sm font-code ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-xs-solid",
            "focus-within:shadow-md-solid focus-within:outline-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-primary",
            variant === "default" ? "h-6 w-full mb-1" : "h-4 w-full mb-0.5",
            variant === "xs" && "text-xs",
            props.className,
          )}
        >
          <RACInput
            ref={ref}
            disabled={props.isDisabled}
            placeholder={placeholder}
            onKeyDownCapture={handleStepKeys}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.stopPropagation();
              }
            }}
            onInput={
              onInputText
                ? (e) => onInputText(e.currentTarget.value)
                : undefined
            }
            className={cn(
              "flex-1",
              "w-full",
              "placeholder:text-muted-foreground",
              "outline-hidden",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variant === "default" ? "px-1.5" : "px-1",
            )}
          />
          <div className={"flex flex-col border-s-2"}>
            <StepperButton
              // `slot={null}` detaches the button from react-aria's stepper so
              // that `onPress` drives the value instead. See `onStep`.
              slot={onStep ? null : "increment"}
              aria-label={onStep ? `Increase ${fieldLabel}`.trim() : undefined}
              onPress={onStep ? () => onStep(1) : undefined}
              isDisabled={props.isDisabled}
              variant={variant}
              excludeFromTabOrder={true}
            >
              <ChevronUp
                aria-hidden={true}
                className={cn("w-3 h-3 -mb-px", variant === "xs" && "w-2 h-2")}
              />
            </StepperButton>
            <div className={"h-px shrink-0 divider bg-border z-10"} />
            <StepperButton
              slot={onStep ? null : "decrement"}
              aria-label={onStep ? `Decrease ${fieldLabel}`.trim() : undefined}
              onPress={onStep ? () => onStep(-1) : undefined}
              isDisabled={props.isDisabled}
              variant={variant}
              excludeFromTabOrder={true}
            >
              <ChevronDown
                aria-hidden={true}
                className={cn("w-3 h-3 -mt-px", variant === "xs" && "w-2 h-2")}
              />
            </StepperButton>
          </div>
        </div>
      </AriaNumberField>
    );
  },
);
NumberField.displayName = "NumberField";

const StepperButton = (props: ButtonProps & { variant?: "default" | "xs" }) => {
  return (
    <Button
      {...props}
      className={cn(
        "cursor-default text-muted-foreground pressed:bg-muted-foreground group-disabled:text-disabled-foreground outline-hidden focus-visible:text-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        !props.isDisabled && "hover:text-primary hover:bg-muted",
        props.variant === "default" ? "px-0.5" : "px-0.25",
      )}
    />
  );
};
