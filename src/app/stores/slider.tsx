import { create } from 'zustand'

//~~~~Slider~~~~
interface StepperStore {
    sectionIndex: number;
    setSectionIndex: (index: number) => void;
    stepIndex: number;
    setStepIndex: (index: number) => void;
    activeStepId: string | null;
    setActiveStepId: (id: string) => void;

    activeStepHeight: number;
    updateHeight: (height: number) => void;

    direction: 1 | -1;
    setDirection: (dir: 1 | -1) => void;

    reset: () => void;
}

export const useSlider = create<StepperStore>((set) => ({
    sectionIndex: 0,
    stepIndex: 0,
    direction: 1,

    activeStepId: null,
    setActiveStepId: (id) => set({ activeStepId: id }),

    activeStepHeight: 0,
    updateHeight: (height) => set({ activeStepHeight: height }),

    setSectionIndex: (index) => set({ sectionIndex: index }),
    setStepIndex: (index) => set({ stepIndex: index }),
    setDirection: (dir) => set({ direction: dir }),
    reset: () => set({ sectionIndex: 0, stepIndex: 0, direction: 1 }),
}));

//~~~~slider titles & subtitles~~~~
type builderTitleType = {
    title: string;
    updateTitle: (title: string) => void;
    subtitle: string;
    updateSubtitle: (subtitle: string) => void;
};

export const useSliderTitle = create<builderTitleType>()((set) => ({
    title: "",
    updateTitle: (title) => set(() => ({ title: title })),
    subtitle: "",
    updateSubtitle: (subtitle) => set(() => ({ subtitle: subtitle })),
}));