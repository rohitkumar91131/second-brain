import { Image as ImageIcon, Minus } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

export default function ImageBlock({ block, onUpdate, onDelete }) {
    return (
        <div className="group flex items-start gap-2 my-6 relative w-full">
            <div className="flex-1 w-full">
                {block.content ? (
                    <div className="relative inline-flex w-full justify-center">
                        <img
                            src={block.content}
                            alt="Block"
                            // h-auto aur object-contain original aspect ratio maintain rakhenge
                            className="max-w-full h-auto object-contain rounded-lg border border-[#e9e9e7]"
                        />
                        <button
                            onClick={onDelete}
                            className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-md text-[#9b9a97] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <Minus size={14} />
                        </button>
                    </div>
                ) : (
                    <CldUploadWidget
                        uploadPreset="notes second brain"
                        onSuccess={(result) => {
                            if (result.info?.secure_url) {
                                onUpdate({ content: result.info.secure_url });
                            }
                        }}
                        options={{
                            multiple: false,
                            resourceType: "image",
                            clientAllowedFormats: ["jpeg", "png", "jpg", "webp", "gif"],
                        }}
                    >
                        {({ open }) => {
                            return (
                                <div
                                    onClick={(e) => {
                                        e.preventDefault();
                                        open();
                                    }}
                                    className="border border-dashed border-[#e9e9e7] bg-[#f7f7f5]/50 hover:bg-[#f7f7f5] transition-colors rounded-lg p-8 flex flex-col items-center justify-center text-sm text-[#9b9a97] w-full cursor-pointer"
                                >
                                    <ImageIcon size={24} className="mb-2 opacity-40" />
                                    <span className="font-medium hover:text-[#37352f] transition-colors">
                                        Click to add image via link, device, or camera
                                    </span>
                                </div>
                            )
                        }}
                    </CldUploadWidget>
                )}
            </div>
        </div>
    )
}