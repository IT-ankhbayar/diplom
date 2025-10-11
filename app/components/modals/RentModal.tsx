'use client';

import useRentModal from "@/app/hooks/useRentModal";

import Modal from './Modal';
import { useMemo, useState } from "react";
import { categories } from "../navbar/Categories";
import Heading from "../Heading";
import CategoryInput from "../Inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from "../Inputs/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../Inputs/Counter";
import ImageUpload from "../Inputs/ImageUpload";
import Input from '../Inputs/Input';
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5
}

const RentModal = () => {
    const router = useRouter();
    const rentModal = useRentModal();
    
    const [step, setStep] = useState(STEPS.CATEGORY);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register, 
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            category:'',
            location: null,
            guestCount: 1,
            roomCount: 1,
            bathroomCount: 1, 
            imageSrc: [],
            price: 1,
            title: '',
            description: ''
        }
    });

    const category = watch('category');
    const location = watch('location');
    const guestCount = watch('guestCount');
    const roomCount = watch('roomCount');
    const bathroomCount = watch('bathroomCount'); 
    const imageSrc = watch('imageSrc');

    // Map component is dynamically imported and does not depend on the current location value.
    // Remove `location` from the dependency array to avoid the exhaustive-deps warning.
    const Map = useMemo(() => dynamic(() => import('../Map'), {
        ssr: false
    }), []);

    // Infer the type of the second parameter accepted by setValue to avoid using `any`.
    type SetValueType = Parameters<typeof setValue>[1];
    const setCustomValue = (id: string, value: unknown) => {
        setValue(id, value as SetValueType, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
    }

    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    }

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== STEPS.PRICE) {
            return onNext();
        }
        setIsLoading(true);

        const submitData = { ...data, imageSrc: data.imageSrc };

        axios.post('/api/listings', submitData)
            .then(() => {
                toast.success('Listing Created!');
                router.refresh();
                reset();
                setStep(STEPS.CATEGORY);
                rentModal.onClose();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            }).finally(() => {
                setIsLoading(false);
            });
    }

    const actionLabel = useMemo(() => {
        if (step === STEPS.PRICE) {
            return 'Create';
        }

        return 'Next';
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined;
        }

        return 'Back';
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading 
                title="Таны байр ямар онцлогтой вэ?"
                subtitle="Ангилалаа сонгоно уу"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {categories.map((item) => (
                    <div key={item.label} className="col-span-1">
                        <CategoryInput
                            onClick={(category) => setCustomValue('category', category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon} />
                    </div>
                ))}
            </div>
        </div>
    )

    if (step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8 items-center">
                <Heading 
                    title="Байршлын хайлт"
                    subtitle="Дүүрэг, хороо, гудамж эсвэл газрын зураг дээрээс сонгоно уу."
                />
                <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
                    <CountrySelect 
                        value={location}
                        onChange={(value) => setCustomValue('location', value)}
                    />
                    <div className="rounded-lg overflow-hidden border border-neutral-200">
                        <Map center={location?.latlng} />
                    </div>
                </div>
            </div>
        )
    }

    if (step === STEPS.INFO) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Өөрийн газрын талаарх үндсэн мэдээллээ хуваалцаарай"
                    subtitle="Танд ямар үед тухтай байдаг вэ?"
                />
                <Counter
                    title="Зочин"
                    subtitle="Та хэдэн зочин зөвшөөрөх вэ?"
                    value={guestCount}
                    onChange={(value) => setCustomValue('guestCount', value)}
                />
                <hr />
                <Counter
                    title="Өрөө"
                    subtitle="Хэдэн өрөөтэй вэ?"
                    value={roomCount}
                    onChange={(value) => setCustomValue('roomCount', value)}
                />
                <hr />
                <Counter
                    title="Угаалгын өрөө"
                    subtitle="Хэдэн угаалгын өрөөтэй вэ??"
                    value={bathroomCount}
                    onChange={(value) => setCustomValue('bathroomCount', value)}
                />
            </div>
        )
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Өөрийн газрын , зургийг нэмнэ үү"
                    subtitle="Зочдод танай газар ямар байгааг харуулаарай!"
                />
                <ImageUpload
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)} />
            </div>
        )
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Та байраа хэрхэн дүрслэх вэ?"
                    subtitle="Авсаархан мөн тухтай!"
                />
                <Input 
                    id="title"
                    label="Title"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <hr />
                <Input 
                    id="description"
                    label="Description"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if (step === STEPS.PRICE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Үнээ бичнэ үү"
                    subtitle="Та өдөрт хэдэн төгрөг авах вэ?"
                />
                <Input
                    id="price"
                    label="Price"
                    
                    type="number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    return (  
        <Modal 
            isOpen={rentModal.isOpen}
            onClose={rentModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title='Your home'
            body={bodyContent}
            afterClose={() => router.push('/profile')}
        />
    );
}
 
export default RentModal;