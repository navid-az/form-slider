
"use client";

import { useMemo } from "react";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "@/components/ui/toast"

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldSet,
    FieldLegend,
} from "@/components/ui/field";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
    Slider,
    SliderSection,
    SliderStep,
    SliderHeader,
    SliderBody,
    SliderFooter,
    SliderTitle,
    SliderNavigator,
} from '@/components/Slider'
import { useSlider } from "@/app/stores/slider";
import {
    Stethoscope,
    Sparkles,
    Sun,
    ShieldCheck,
    Activity,
    Smile,
    PlusCircle,
} from "lucide-react";

// --------------------------------------------------
// Schema
// --------------------------------------------------

const dentalBookingSchema = z.object({
    service_type: z.enum(
        [
            "checkup",
            "cleaning",
            "whitening",
            "filling",
            "root_canal",
            "orthodontics",
            "other",
        ],
        { message: "Please select a treatment." }
    ).nullable(),

    dentist_preference: z.enum(
        ["any", "dr_sarah", "dr_james"],
        { message: "Please select a dentist preference." }
    ).nullable(),

    appointment_date: z
        .string()
        .min(1, "Please select an appointment date.")
        .refine(
            (value) => value >= new Date().toLocaleDateString("en-CA"),
            "Please select today or a future date."
        ),

    appointment_time: z
        .string()
        .min(1, "Please select a preferred time."),

    patient_name: z
        .string()
        .trim()
        .min(2, "Please enter your full name.")
        .max(100, "Your name must be 100 characters or fewer."),

    phone: z
        .string()
        .trim()
        .min(7, "Please enter a valid phone number.")
        .max(20, "Please enter a valid phone number.")
        .regex(
            /^[+\d][\d\s()-]*$/,
            "Please enter a valid phone number."
        ),

    notes: z
        .string()
        .max(500, "Notes must be 500 characters or fewer."),
});

type DentalBookingValues = z.infer<typeof dentalBookingSchema>;

// --------------------------------------------------
// Form defaults
// --------------------------------------------------

const defaultValues: DentalBookingValues = {
    service_type: null,
    dentist_preference: null,
    appointment_date: "",
    appointment_time: "",
    patient_name: "",
    phone: "",
    notes: "",
};

// --------------------------------------------------
// Demo options
// --------------------------------------------------

const treatments = [
    {
        value: "checkup",
        label: "Dental check-up",
        description: "Routine examination and oral health assessment",
        icon: Stethoscope,
    },
    {
        value: "cleaning",
        label: "Teeth cleaning",
        description: "Professional cleaning and plaque removal",
        icon: Sparkles,
    },
    {
        value: "whitening",
        label: "Teeth whitening",
        description: "Improve the appearance of your smile",
        icon: Sun,
    },
    {
        value: "filling",
        label: "Dental filling",
        description: "Treatment for cavities and tooth decay",
        icon: ShieldCheck,
    },
    {
        value: "root_canal",
        label: "Root canal",
        description: "Treatment for an infected or damaged tooth",
        icon: Activity,
    },
    {
        value: "orthodontics",
        label: "Orthodontics",
        description: "Braces and teeth alignment consultation",
        icon: Smile,
    },
    {
        value: "other",
        label: "Other treatment",
        description: "Discuss a different dental concern",
        icon: PlusCircle,
    },
] as const;

const dentists = [
    { value: "any", label: "Any available dentist", description: "Book with the first available dentist" },
    { value: "dr_sarah", label: "Dr. Sarah Mitchell", description: "General dentistry and cosmetic treatments" },
    { value: "dr_james", label: "Dr. James Wilson", description: "Restorative dentistry and root canal treatment" },
] as const;

const appointmentTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
] as const;

// --------------------------------------------------
// Component
// --------------------------------------------------
export function DentalBookingForm() {
    const form = useForm<DentalBookingValues>({
        resolver: zodResolver(dentalBookingSchema),
        defaultValues,
        mode: "onTouched",
    });

    const onSubmit = (values: DentalBookingValues) => {
        // Demonstration only. No API or database request.
        console.log("Dental appointment request:", values);

        const treatment = treatments.find(
            (item) => item.value === values.service_type
        );

        toast.add({
            type: 'success',
            description: `Your ${treatment?.label.toLowerCase()} request is ready for the clinic to review.`,
        });
    };

    const onError = (
        errors: Partial<
            Record<keyof DentalBookingValues, { message?: string }>
        >
    ) => {
        console.error("Dental booking validation failed:", errors);

        toast.add({
            type: 'error',
            description: "Some fields need your attention before you can continue.",
        });
    };

    const sections: SliderSection[] = [
        {
            id: "appointment",
            title: "Appointment",
            steps: [
                {
                    id: "treatment",
                    subtitle: "What brings you to our dental clinic?",
                    show: true,
                    fields: ["service_type"],
                    autoAdvance: true,
                    component: (
                        <SliderStep stepId="treatment" className="flex flex-col gap-5">
                            <Controller
                                control={form.control}
                                name="service_type"
                                render={({ field, fieldState }) => (
                                    <FieldSet data-invalid={fieldState.invalid}>
                                        <FieldLegend>Choose a treatment</FieldLegend>
                                        <FieldDescription>
                                            Select the service you would like to book.
                                        </FieldDescription>

                                        <RadioGroup
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                        >
                                            {treatments.map((treatment) => {
                                                const Icon = treatment.icon;
                                                return (
                                                    <Field
                                                        key={treatment.value}
                                                        orientation="horizontal"
                                                        data-invalid={fieldState.invalid}
                                                        className="relative rounded-xl border p-4 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/5 hover:bg-muted/50"
                                                    >
                                                        <div className="grid flex-1 gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="size-4" aria-hidden="true" />
                                                                <FieldLabel
                                                                    htmlFor={`treatment-${treatment.value}`}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {treatment.label}
                                                                </FieldLabel>
                                                            </div>

                                                            <FieldDescription>
                                                                {treatment.description}
                                                            </FieldDescription>
                                                        </div>

                                                        <RadioGroupItem
                                                            id={`treatment-${treatment.value}`}
                                                            value={treatment.value}
                                                            aria-invalid={fieldState.invalid}
                                                        />

                                                        <label
                                                            htmlFor={`treatment-${treatment.value}`}
                                                            aria-hidden="true"
                                                            className="absolute inset-0 cursor-pointer rounded-xl"
                                                        />
                                                    </Field>
                                                )
                                            })}
                                        </RadioGroup>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldSet>
                                )}
                            />
                        </SliderStep>
                    ),
                },
                {
                    id: "dentist",
                    subtitle: "Do you have a preferred dentist?",
                    show: true,
                    fields: ["dentist_preference"],
                    autoAdvance: true,
                    component: (
                        <SliderStep stepId="dentist" className="flex flex-col gap-5">
                            <Controller
                                control={form.control}
                                name="dentist_preference"
                                render={({ field, fieldState }) => (
                                    <FieldSet data-invalid={fieldState.invalid}>
                                        <FieldLegend>Choose your dentist</FieldLegend>
                                        <FieldDescription>
                                            You can select a specific dentist or let us choose one.
                                        </FieldDescription>

                                        <RadioGroup
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="grid grid-cols-1 gap-3"
                                        >
                                            {dentists.map((dentist) => (
                                                <Field
                                                    key={dentist.value}
                                                    orientation="horizontal"
                                                    data-invalid={fieldState.invalid}
                                                    className="rounded-xl border transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/5 hover:bg-muted/50"
                                                >
                                                    <FieldLabel
                                                        htmlFor={`dentist-${dentist.value}`}
                                                        className="flex w-full cursor-pointer items-center gap-4 p-4"
                                                    >
                                                        <RadioGroupItem
                                                            id={`dentist-${dentist.value}`}
                                                            value={dentist.value}
                                                            aria-invalid={fieldState.invalid}
                                                        />

                                                        <div className="grid flex-1 gap-1">
                                                            <span className="font-medium">
                                                                {dentist.label}
                                                            </span>
                                                            <FieldDescription>
                                                                {dentist.description}
                                                            </FieldDescription>
                                                        </div>
                                                    </FieldLabel>
                                                </Field>
                                            ))}
                                        </RadioGroup>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldSet>
                                )}
                            />
                        </SliderStep>
                    ),
                },
            ],
        },
        {
            id: "schedule",
            title: "Schedule",
            steps: [
                {
                    id: "appointment_datetime",
                    subtitle: "When would you like to visit us?",
                    show: true,
                    fields: ["appointment_date", "appointment_time"],
                    component: (
                        <SliderStep
                            stepId="appointment_datetime"
                            className="flex flex-col gap-6"
                        >

                            <Controller
                                control={form.control}
                                name="appointment_date"
                                render={({ field, fieldState }) => {
                                    const selectedDate = field.value
                                        ? parseISO(field.value)
                                        : undefined;

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Preferred date
                                            </FieldLabel>

                                            <Popover>
                                                <PopoverTrigger
                                                    render={
                                                        <Button
                                                            id={field.name}
                                                            type="button"
                                                            variant="outline"
                                                            data-empty={!selectedDate}
                                                            aria-invalid={fieldState.invalid}
                                                            aria-describedby={`${field.name}-description`}
                                                            className="h-12 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                                        />
                                                    }
                                                >
                                                    <CalendarIcon />
                                                    {selectedDate ? (
                                                        format(selectedDate, "PPP")
                                                    ) : (
                                                        <span>Select an appointment date</span>
                                                    )}
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={(date) => {
                                                            field.onChange(
                                                                date ? format(date, "yyyy-MM-dd") : ""
                                                            );
                                                        }}
                                                        disabled={{ before: new Date() }}
                                                        captionLayout="dropdown"
                                                        startMonth={new Date()}
                                                        endMonth={
                                                            new Date(
                                                                new Date().getFullYear() + 2,
                                                                11,
                                                                31
                                                            )
                                                        }
                                                        autoFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <FieldDescription id={`${field.name}-description`}>
                                                Choose a date up to two years ahead. Actual appointment
                                                availability is not checked in this demo.
                                            </FieldDescription>

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />


                            <Controller
                                control={form.control}
                                name="appointment_time"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Preferred time
                                        </FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                className="h-12! w-full"
                                            >
                                                <SelectValue placeholder="Select a time" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {appointmentTimes.map((time) => (
                                                    <SelectItem className='h-12!' key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Select your preferred appointment time.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </SliderStep>
                    ),
                },
            ],
        },
        {
            id: "patient_details",
            title: "Patient details",
            steps: [
                {
                    id: "patient_contact",
                    subtitle: "Who should we contact about your appointment?",
                    show: true,
                    fields: ["patient_name", "phone"],
                    component: (
                        <SliderStep stepId="patient_contact" className="flex flex-col gap-5">
                            <Controller
                                control={form.control}
                                name="patient_name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Full name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="e.g. Alex Morgan"
                                            autoComplete="name"
                                            aria-invalid={fieldState.invalid}
                                            className="h-12"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="phone"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Phone number
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="tel"
                                            placeholder="e.g. +1 555 123 4567"
                                            autoComplete="tel"
                                            aria-invalid={fieldState.invalid}
                                            className="h-12"
                                        />
                                        <FieldDescription>
                                            The clinic can use this number to follow up on your request.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </SliderStep>
                    ),
                },
                {
                    id: "additional_notes",
                    subtitle: "Is there anything else our dental team should know?",
                    show: true,
                    fields: ["notes"],
                    optional: true,
                    component: (
                        <SliderStep stepId="additional_notes" className="flex flex-col gap-5">
                            <Controller
                                control={form.control}
                                name="notes"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Additional notes (optional)
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            placeholder="Tell us about any symptoms, concerns, or special requests..."
                                            aria-invalid={fieldState.invalid}
                                            className="min-h-36 resize-y"
                                        />
                                        <FieldDescription>
                                            Please avoid including sensitive medical information in
                                            this demonstration form.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </SliderStep>
                    ),
                },
            ],
        },
    ];

    // Keep the same section filtering approach as your existing builder.
    const watchedValues = form.watch();

    const validSections = useMemo(() => {
        return sections
            .map((section) => ({
                ...section,
                steps: section.steps.filter((step) => step.show),
            }))
            .filter((section) => section.steps.length > 0);
    }, [watchedValues]);

    const {
        sectionIndex,
        stepIndex,
        direction,
    } = useSlider();
    const activeSection = validSections[sectionIndex];
    const activeStep = activeSection?.steps[stepIndex];

    if (!activeStep) return null;

    // Animation variants for the step transitions
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 200 : -200,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -200 : 200,
            opacity: 0,
        }),
    };

    return (
        <FormProvider {...form}>
            <form
                name="dental-booking-form"
                onSubmit={form.handleSubmit(onSubmit, onError)}
                noValidate
                className="mx-auto w-full max-w-4xl px-4 sm:px-12 md:px-16 lg:px-0"
            >
                <Slider validSections={validSections}>
                    <SliderHeader>
                        <SliderTitle />
                    </SliderHeader>

                    <SliderBody>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeStep.id}
                                variants={variants}
                                custom={direction}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.2 }}
                                className="absolute w-full"
                            >
                                {activeStep.component}
                            </motion.div>
                        </AnimatePresence>
                    </SliderBody>

                    <SliderFooter>
                        <SliderNavigator submitBtnText="Book Appointment" validSections={validSections} />
                    </SliderFooter>
                </Slider>
            </form>
        </FormProvider>
    );
}