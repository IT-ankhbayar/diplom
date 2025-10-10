'use client';

import { useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";

interface ImageUploadProps {
    onChange: (value: string[]) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onChange,
    value = [],
}) => {
    const handleUpload = useCallback(() => {
        if (typeof window === 'undefined') return;
        // Cloudinary is injected on window by their widget script. Narrow safely from unknown.
        const w = window as unknown as { cloudinary?: any };
        const cloudinary = w.cloudinary;

        if (!cloudinary || typeof cloudinary.createUploadWidget !== 'function') {
            alert('Cloudinary upload widget is not loaded. Please check your Cloudinary setup.');
            return;
        }

        const widget = cloudinary.createUploadWidget(
            {
                cloudName: (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').replace(/"/g, ''),
                uploadPreset: 'hotelbooking',
                multiple: true,
                maxFiles: 5,
            },
            (error: unknown, result: unknown) => {
                // narrow result shape safely
                if (error) {
                    console.error('Cloudinary widget error:', error);
                    return;
                }

                const res = result as { event?: string; info?: { secure_url?: string } } | undefined;
                if (res && res.event === 'success' && res.info && res.info.secure_url) {
                    const url = res.info.secure_url;
                    if (url && !value.includes(url) && value.length < 5) {
                        onChange([...value, url]);
                    }
                }
            }
        );

        widget.open();
    }, [onChange, value]);

    const handleRemove = (idx: number) => {
        const newArr = value.filter((_, i) => i !== idx);
        onChange(newArr);
    };

    return (
        <div
            className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 p-8 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 w-full h-64 max-w-md mx-auto"
            onClick={handleUpload}
            style={{ minHeight: '16rem', minWidth: '16rem' }}
        >
            <TbPhotoPlus size={50} />
            <div className="font-semibold text-lg">Click to upload</div>
            <button
                type="button"
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ zIndex: 2 }}
                disabled={value.length >= 5}
                aria-label="Upload images"
            />

            {value.length > 0 && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 pointer-events-none">
                    {value[0] && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={value[0]}
                                alt="Main preview"
                                className="w-full h-full object-cover rounded"
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(0);
                                }}
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full px-2 py-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                                style={{ pointerEvents: 'auto' }}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
