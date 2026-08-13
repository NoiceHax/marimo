/* Copyright 2026 Marimo. All rights reserved. */
import { type JSX, useId } from "react";
import { z } from "zod";
import { NumberField } from "@/components/ui/number-field";
import { useDebounceControlledState } from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";
import { clamp } from "@/utils/math";
import { countFractionDigits, roundToFractionDigits } from "@/utils/numbers";
import type { IPlugin, IPluginProps, Setter } from "../types";
import { Labeled } from "./common/labeled";

type T = number;

interface Data {
  start?: T | null;
  stop?: T | null;
  step?: T;
  label: string | null;
  debounce: boolean;
  fullWidth: boolean;
  disabled?: boolean;
}

export class NumberPlugin implements IPlugin<T | null, Data> {
  tagName = "marimo-number";

  validator = z.object({
    initialValue: z.number().nullish(),
    label: z.string().nullable(),
    start: z.number().nullish(),
    stop: z.number().nullish(),
    step: z.number().optional(),
    debounce: z.boolean().default(false),
    fullWidth: z.boolean().default(false),
    disabled: z.boolean().optional(),
  });

  render(props: IPluginProps<T | null, Data>): JSX.Element {
    return (
      <NumberComponent
        {...props.data}
        value={props.value}
        setValue={props.setValue}
      />
    );
  }
}

interface NumberComponentProps extends Data {
  value: T | null;
  setValue: Setter<T | null>;
}

const NumberComponent = (props: NumberComponentProps): JSX.Element => {
  let id = useId();
  if (import.meta.env.VITEST) {
    id = "test-id";
  }

  const initialValue = withoutNaN(props.value);

  // Create a debounced value of 200
  const { value, onChange } = useDebounceControlledState({
    initialValue: initialValue,
    delay: 200,
    disabled: !props.debounce,
    onChange: props.setValue,
  });

  const handleChange = (newValue: number) => {
    onChange(withoutNaN(newValue));
  };

  // `step` is only an increment: it moves the value by `step` but never
  // constrains what the user may type.
  // https://github.com/marimo-team/marimo/issues/9106
  const handleStep = (direction: 1 | -1) => {
    const increment = props.step ?? 1;
    let next: number;
    if (value == null) {
      // An empty input starts at the bound we are stepping towards, matching
      // react-aria's own stepper.
      next = (direction === 1 ? props.start : props.stop) ?? 0;
    } else {
      // Keep the result on a clean decimal grid; 2.23345 + 0.01 would
      // otherwise land on 2.2434500000000003.
      const digits = Math.max(
        countFractionDigits(value),
        countFractionDigits(increment),
      );
      next = roundToFractionDigits(value + direction * increment, digits);
    }
    handleChange(
      clamp(
        next,
        props.start ?? Number.NEGATIVE_INFINITY,
        props.stop ?? Number.POSITIVE_INFINITY,
      ),
    );
  };

  return (
    <Labeled label={props.label} id={id} fullWidth={props.fullWidth}>
      <NumberField
        data-testid="marimo-plugin-number-input"
        className={cn("min-w-[3em]", props.fullWidth && "w-full")}
        minValue={props.start ?? undefined}
        maxValue={props.stop ?? undefined}
        // This needs to be `?? NaN` since `?? undefined` makes  uncontrolled component
        // and can lead to leaving the old value in forms (https://github.com/marimo-team/marimo/issues/7352)
        // We out NaNs later
        value={value ?? Number.NaN}
        onChange={handleChange}
        onStep={handleStep}
        id={id}
        aria-label={props.label || "Number input"}
        isDisabled={props.disabled}
      />
    </Labeled>
  );
};

function withoutNaN(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return value;
}
