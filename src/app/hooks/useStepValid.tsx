
'use client'

import { useState, useEffect } from "react";
import { useWatch, useFormContext } from "react-hook-form";

// Check wether step is valid
// - if the step has no `fields`, it's always considered valid (e.g. an info-only step)
// - otherwise we ask RHF to validate just those fields, silently

// NOTE: This hook is supposed to be used inside a RHF context boundary
export function useStepValid(stepId: string, fields: string[] = []) {
    const form = useFormContext();
    const values = useWatch({ control: form.control, name: fields });

    // track which step the current `valid` value was actually computed for
    const [state, setState] = useState<{ stepId: string; valid: boolean }>({
        stepId,
        valid: fields.length === 0,
    });

    useEffect(() => {
        //Informative step (no required fields)
        if (fields.length === 0) {
            setState({ stepId, valid: true });
            return;
        }

        // User must interact with required field(s) before checking if step is valid
        const hasInteraction = fields.some(
            (name) => form.getFieldState(name, form.formState).isDirty
        );

        // Initially assume step is not valid since user hasn't interacted with the step yet
        if (!hasInteraction) {
            setState({ stepId, valid: false });
            return;
        }

        form.trigger(fields, { shouldFocus: false }).then((valid) => {
            setState({ stepId, valid });
        });
    }, [values, stepId]);

    // CRITICAL: if `state` was computed for a different step than the one
    // currently active, treat it as "not yet known" -> false, instead of
    // returning a stale true/false left over from the previous step.
    return state.stepId === stepId ? state.valid : false;
}