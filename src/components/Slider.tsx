"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

//libraries
import gsap from "gsap";

//hooks
import { useSliderTitle, useSlider } from "../app/stores/slider";

//components
import { Button } from "@/components/ui/button";

//utils
import { cn } from "../app/utils/cn";

//types
export type Step = {
    id: string;
    subtitle: string;
    component: React.ReactNode;
    show?: boolean
    optional?: boolean;
    fields?: string[];
    autoAdvance?: boolean;
}
export type SliderSection = {
    id: string;
    title: string;
    steps: Step[];
};
type SliderType = {
    children: React.ReactNode;
    validSections: SliderSection[];
};
type stepType = {
    stepId: string;
    className?: string;
    children: React.ReactNode;
};

export function Slider({ children, validSections }: SliderType) {
    const { updateTitle, updateSubtitle } = useSliderTitle();
    const { setActiveStepId, stepIndex, sectionIndex } = useSlider();

    const activeSection = validSections[sectionIndex];
    const activeStep = activeSection.steps[stepIndex];

    useEffect(() => {
        if (activeStep?.id) {
            setActiveStepId(activeStep.id);
        }
        updateSubtitle(activeStep.subtitle);
    }, [activeStep?.id]);

    useEffect(() => {
        updateTitle(validSections[sectionIndex].title);
    }, [sectionIndex]);

    return (
        <section className="flex h-screen w-full flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out sm:gap-7">
            {children}
        </section>
    );
}

export function SliderHeader({ children }: { children: React.ReactNode }) {
    return (
        <header className="flex w-full gap-1 justify-between items-center">
            {children}
        </header>
    );
}

export function SliderBody({ children }: { children: React.ReactNode }) {
    const sliderBodyRef = useRef<HTMLDivElement>(null);
    const { activeStepHeight } = useSlider();

    //Update slider body height based on active step's height
    useEffect(() => {
        if (sliderBodyRef.current) {
            sliderBodyRef.current.style.height = `${activeStepHeight}px`;
        }
    }, [activeStepHeight]);

    return (
        <div
            ref={sliderBodyRef}
            className={`relative flex h-full w-full transition-all duration-300 ease-in-out`}
        >
            {children}
        </div>
    );
}

export function SliderStep({ stepId, className, children }: stepType) {
    const stepRef = useRef<HTMLDivElement>(null);

    const { activeStepId, updateHeight } = useSlider();

    useEffect(() => {
        if (activeStepId === stepId && stepRef.current) {
            const observer = new ResizeObserver(() => {
                if (stepRef.current) {
                    const newHeight = stepRef.current.offsetHeight;
                    updateHeight(newHeight);
                }
            });
            observer.observe(stepRef.current);
            return () => observer.disconnect();
        }
    }, [activeStepId]);

    return (
        <div
            ref={stepRef}
            className={cn(
                "absolute flex w-full flex-col justify-between gap-4 ",
                className
            )}
        >
            {children}
        </div>
    );
}

export function SliderFooter({ children }: { children: React.ReactNode }) {
    return (
        <footer className="flex w-full items-center justify-between">
            {children}
        </footer>
    );
}

export function SliderTitle() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLHeadingElement>(null);

    const sectionTitle = useSliderTitle((state) => state.title);
    const prevSectionTitle = useSliderTitle.getState().title;
    const stepTitle = useSliderTitle((state) => state.subtitle);
    const prevStepTitle = useSliderTitle.getState().subtitle;

    const [title, setTitle] = useState(prevSectionTitle);
    const [subtitle, setSubtitle] = useState(prevStepTitle);

    //animate section title change
    //initially it will show previous section title before fading it to the newly set title for better UI
    useEffect(() => {
        gsap.to(titleRef.current, {
            x: 30,
            opacity: 0,
            duration: 0.28,
        });
        setTimeout(() => {
            //change section title to the newly updated global state title
            setTitle(sectionTitle);

            gsap.to(titleRef.current, {
                x: 0,
                opacity: 1,
                duration: 0.28,
            });
        }, 150);
    }, [sectionTitle]);

    //animate step title change
    //initially it will show previous step title before fading it to the newly set title for better UI
    useEffect(() => {
        gsap.to(subtitleRef.current, {
            x: 50,
            opacity: 0,
            duration: 0.38,
        });
        setTimeout(() => {
            //change step title to the newly updated global state title
            setSubtitle(stepTitle);

            gsap.to(subtitleRef.current, {
                x: 0,
                opacity: 1,
                duration: 0.38,
            });
        }, 150);
    }, [stepTitle]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between">
                <h1
                    ref={titleRef}
                    className="select-none text-xl font-black text-royal-green sm:text-3xl"
                >
                    {title}
                </h1>
                {/* <div className="flex gap-4 text-lg">
          <span>activeStep:{activeStep}</span>
          <span>stepCount:{stepCount}</span>
          <span>activeSection:{activeSection}</span>
          <span>sectionCount:{sectionCount}</span>
        </div> */}
            </div>
            <h3
                ref={subtitleRef}
                className="select-none text-sm font-medium text-royal-green sm:text-base"
            >
                {subtitle}
            </h3>
        </div>
    );
}


import { useStepValid } from "@/app/hooks/useStepValid";


type SliderNavigatorType = {
    disableSubmitBtn?: boolean;
    isDirty?: boolean;
    isEditing?: boolean;
    submitBtnText?: string;
    validSections: SliderSection[]
};

export function SliderNavigator({
    disableSubmitBtn = false,
    isDirty = false,
    isEditing = false,
    submitBtnText,
    validSections,
}: SliderNavigatorType) {
    const {
        sectionIndex,
        stepIndex,
        setSectionIndex,
        setStepIndex,
        setDirection,
    } = useSlider();

    const activeSection = validSections[sectionIndex];
    const sectionCount = validSections.length;

    const activeStep = activeSection.steps[stepIndex];
    const stepCount = activeSection.steps.length;

    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);

    const isStepValid = useStepValid(activeStep.id, activeStep.fields ?? []);

    // Tracks validity for every step in the active section, keyed by step id.
    // Each entry is populated by a <StepValidityTracker> mounted below, which
    // calls useStepValid exactly once per step (fixed hook-call count per
    // component instance, so it's safe even though stepCount varies by section).
    const [stepValidityMap, setStepValidityMap] = useState<Record<string, boolean>>({});

    const handleStepValidityChange = useCallback((id: string, valid: boolean) => {
        setStepValidityMap((prev) => (prev[id] === valid ? prev : { ...prev, [id]: valid }));
    }, []);

    // A dot is disabled if ANY step before it (within the same section) is mandatory and not yet valid 
    const isDotDisabled = useCallback(
        (index: number) => {
            for (let i = 0; i < index; i++) {
                const step = activeSection.steps[i];
                const valid = stepValidityMap[step.id] ?? false;
                if (step.optional !== true && !valid) {
                    return true;
                }
            }
            return false;
        },
        [activeSection, stepValidityMap]
    );

    const nextBtnRef = useRef<HTMLButtonElement>(null);
    const prevBtnRef = useRef<HTMLButtonElement>(null);
    const editBtnRef = useRef<HTMLButtonElement>(null);
    const submitBtnRef = useRef<HTMLButtonElement>(null);
    const buttonsContainerRef = useRef<HTMLDivElement>(null);

    // Tactile animation for navigation buttons
    // useTactileAnimation(nextBtnRef, {});
    // useTactileAnimation(prevBtnRef, {});
    // useTactileAnimation(editBtnRef, {});
    // useTactileAnimation(submitBtnRef, {});

    // Set initial active section and active step on mount
    useEffect(() => {
        setStepIndex(0);
        setSectionIndex(0);
    }, []);

    const isLastStep = stepIndex === stepCount - 1 && sectionIndex === sectionCount - 1;
    const isFirstStep = stepIndex === 0 && sectionIndex === 0;
    const isMandatoryIncomplete = activeStep.optional !== true && !isStepValid;

    const allMandatoryStepsValid = validSections.every((section) =>
        section.steps.every((step) => {
            if (step.optional === true) return true;
            return stepValidityMap[step.id] === true;
        })
    );

    // Disable Navigation buttons
    useEffect(() => {
        setPrevDisabled(isFirstStep);
        setNextDisabled(isLastStep || isMandatoryIncomplete);
    }, [activeStep, isStepValid, sectionCount, stepCount, stepIndex, sectionIndex]);

    // Go to next step/section
    const goNext = () => {
        const isLastStepInSection = stepIndex === stepCount - 1;
        const isLastSection = sectionIndex === sectionCount - 1;

        setDirection(1);

        if (!isLastStepInSection) {
            setStepIndex(stepIndex + 1);
        } else if (!isLastSection) {
            setSectionIndex(sectionIndex + 1);
            setStepIndex(0);
        }
    };

    // Go to previous step/section
    const goBack = () => {
        const isFirstStepInSection = stepIndex === 0;
        const isFirstSection = sectionIndex === 0;

        setDirection(-1);

        if (!isFirstStepInSection) {
            setStepIndex(stepIndex - 1);
        } else if (!isFirstSection) {
            setSectionIndex(sectionIndex - 1);
            setStepIndex(validSections[sectionIndex - 1].steps.length - 1);
        }
    };

    // Automatically advance to the next step if autoAdvance is set to true
    const autoAdvancedStepId = useRef<string | null>(null);

    useEffect(() => {
        if (!activeStep.autoAdvance || !isStepValid) return;
        if (autoAdvancedStepId.current === activeStep.id) return; // already advanced from this step

        // Prevent auto advance from a retrigger between renders
        autoAdvancedStepId.current = activeStep.id;

        const timeout = setTimeout(() => {
            goNext();
        }, 350);

        return () => clearTimeout(timeout);
    }, [isStepValid, activeStep]);

    return (
        <div className="flex w-full items-center justify-between rtl:flex-row-reverse">
            {/* Invisible trackers: one per step in the active section, each reporting
          that step's validity up into stepValidityMap. Keyed by step.id so each
          mounts once and calls useStepValid a single, fixed number of times. */}
            {activeSection.steps.map((step) => (
                <StepValidityTracker key={step.id} step={step} onChange={handleStepValidityChange} />
            ))}

            <Button
                ref={prevBtnRef}
                type="button"
                disabled={prevDisabled}
                onClick={goBack}
                className="h-9 select-none rounded-full px-5 transition-opacity duration-300 sm:h-10 sm:px-6"
            >
                Previous
            </Button>
            <div className={cn("w-full flex justify-center transition-all duration-200 ease-in-out")}>
                <div className="flex w-max gap-2 border border-royal-green/20 rounded-full bg-soft-blue p-2 rtl:flex-row-reverse">
                    {Array.from({ length: stepCount }, (_, index) => (
                        <SliderNavigatorDot
                            key={index}
                            index={index}
                            active={stepIndex == index}
                            disabled={isDotDisabled(index)}
                        ></SliderNavigatorDot>
                    ))}
                </div>
            </div>
            <div ref={buttonsContainerRef} className={cn("flex gap-2 rtl:flex-row-reverse transition-all duration-300")}>
                <Button
                    ref={nextBtnRef}
                    type="button"
                    disabled={nextDisabled}
                    onClick={goNext}
                    className="h-9 select-none rounded-full px-5 transition-opacity duration-300 sm:h-10 sm:px-6"
                >
                    Next
                </Button>
                {!disableSubmitBtn && isLastStep && !isEditing && allMandatoryStepsValid && (
                    <Button
                        ref={submitBtnRef}
                        disabled={false}
                        className="h-9 rounded-full px-5 sm:h-10 sm:px-6 transition-opacity duration-300"
                        type="submit"
                    >
                        {submitBtnText ?? "Create"}
                    </Button>
                )}
                {isEditing && (
                    <Button
                        ref={editBtnRef}
                        disabled={!isDirty}
                        className="h-9 select-none rounded-full transition-opacity duration-300 px-5 sm:h-10 sm:px-6"
                        type="submit"
                    >
                        Edit
                    </Button>
                )}
            </div>
        </div>
    );
}

// Renders nothing. Exists purely to call useStepValid exactly once for a
// given step (keyed by step.id) and report the result upward, without
// forcing the parent to call the hook a variable number of times.
type StepValidityTrackerProps = {
    step: Step;
    onChange: (id: string, valid: boolean) => void;
};

function StepValidityTracker({ step, onChange }: StepValidityTrackerProps) {
    const valid = useStepValid(step.id, step.fields ?? []);

    useEffect(() => {
        onChange(step.id, valid);
    }, [step.id, valid, onChange]);

    return null;
}

type SliderNavigatorDot = { active?: boolean; index: number, disabled?: boolean };

function SliderNavigatorDot({ active, index, disabled = false }: SliderNavigatorDot) {
    const { setStepIndex } = useSlider();
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => setStepIndex(index)}
            className={cn(
                "scale-pro h-3 w-3 rounded-full transition-all duration-300 sm:h-3.5 sm:w-3.5",
                active
                    ? "scale-110 bg-primary!"
                    : disabled
                        ? "scale-90 cursor-default bg-muted-foreground/30"
                        : "scale-90 cursor-pointer bg-muted hover:bg-primary/50"
            )}
        ></button>
    );
}