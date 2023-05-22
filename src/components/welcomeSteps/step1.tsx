import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import debounce from "lodash.debounce"
import { useEffect, useMemo, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { StepComponentProps } from "@/pages/welcome"
import { useIsUsernameAvailable } from "@/hooks/useIsUsernameAvailable"
import type { Database } from "@/lib/dbtypes"

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters long")
    .max(14, "Must be 14 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Must be alphanumeric"),
})

type UsernameForm = z.infer<typeof usernameSchema>

const INPUT_DEBOUNCE = 500 // ms

export const Step1 = ({ data, setData }: StepComponentProps) => {
  const supabase = useSupabaseClient<Database>()

  const { register, formState, clearErrors, setError, setFocus } = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
  })

  // Message that is shown if all the username checks pass (validation and availability)
  const [successMessage, setSuccessMessage] = useState("")

  // Checks username availability
  const [candidateUsername, setCandidateUsername] = useState<string>(data.username)

  // Checks username availability when we have a candidate username
  const { data: usernameDbRes } = useIsUsernameAvailable(supabase, candidateUsername)

  // Debouncing input change
  const debouncedInputChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrors("username")
        const parsedUsername = usernameSchema.safeParse({ username: e.target.value })

        if (parsedUsername.success) {
          setCandidateUsername(e.target.value)
        } else {
          setError("username", {
            type: "manual",
            message: parsedUsername.error.issues[0].message,
          })
          setData((prev) => ({ ...prev, username: "" }))
        }
      }, INPUT_DEBOUNCE),
    [clearErrors, setError, setData]
  )

  // Cleans up the debounced input change
  useEffect(() => {
    return () => {
      debouncedInputChange.cancel()
    }
  }, [debouncedInputChange])

  // If username is available set the data in the parent state
  useEffect(() => {
    if (usernameDbRes) {
      if (usernameDbRes.isAvailable) {
        setData((prev) => ({ ...prev, username: usernameDbRes.username }))
        setSuccessMessage("Username available!")
      } else {
        setError("username", {
          type: "manual",
          message: "Username is not available",
        })
        setData((prev) => ({ ...prev, username: "" }))
      }
    }
  }, [setData, setError, usernameDbRes, candidateUsername])

  // Initial focus on the input
  useEffect(() => setFocus("username"), [setFocus])

  return (
    <div className="w-full max-w-xl">
      <h1 className="select-none text-2xl font-bold">Setting up your username</h1>
      <form className="mt-10 flex flex-col gap-4">
        <label htmlFor="username" className="text-lg">
          Username
        </label>
        <input
          autoCorrect="off"
          type="text"
          id="username"
          defaultValue={data.username}
          placeholder="Enter your username"
          className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-3 text-zinc-900 placeholder:text-zinc-400
          dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          {...register("username", {
            onChange: debouncedInputChange,
          })}
        />
        {(formState.errors.username && (
          <p className="text-red-500">{formState.errors.username.message}</p>
        )) ||
          (successMessage && <p className="text-green-500">Username available!</p>)}
      </form>
    </div>
  )
}
