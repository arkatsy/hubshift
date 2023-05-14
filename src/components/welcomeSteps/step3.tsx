import { StepComponentProps } from "@/pages/welcome"

export default function Step3({ data, setData }: StepComponentProps) {
  const onBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData({ ...data, bio: e.target.value })
  }

  return (
    <div className="w-full max-w-xl">
      <h1 className="select-none text-2xl font-bold">Setting up your bio</h1>
      <div className="mt-10">
        <textarea
          className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-2 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          onChange={onBioChange}
          defaultValue={data.bio}
        />
      </div>
    </div>
  )
}
