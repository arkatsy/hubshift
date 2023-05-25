import Image from "next/image"
import type { StepComponentProps } from "@/lib/types"

export const Step2 = ({ setBlobAvatar, data }: StepComponentProps) => {
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBlobAvatar(file)
    }
  }

  return (
    <div className="w-full max-w-xl">
      <h1 className="select-none text-2xl font-bold">Setting up your avatar</h1>
      <div className="mt-10 flex flex-col items-center gap-4">
        <Image
          width={100}
          height={100}
          className="my-4 h-36 w-36 rounded-full"
          src={data.avatar_url}
          alt="Your avatar"
        />
        <input id="avatar" type="file" accept="image/*" onChange={onAvatarChange} />
      </div>
    </div>
  )
}
