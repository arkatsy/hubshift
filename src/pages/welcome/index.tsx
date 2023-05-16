import { Step1, Step2, Step3 } from "@/components"
import { useCreateProfile, useGenDefaultAvatar } from "@/hooks"
import type { Database } from "@/lib/dbtypes"
import { type SupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { type GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useEffect, useState, Fragment } from "react"

export type StepComponentProps = {
  setData: React.Dispatch<React.SetStateAction<ProfileData>>
  setBlobAvatar: React.Dispatch<React.SetStateAction<Blob | null>>
  data: ProfileData
}

export type Step = {
  id: 0 | 1 | 2
  title: string
  status: "current" | "complete" | "incomplete"
  Component: React.ElementType<StepComponentProps>
}

const fetchUserIdWithId = async (client: SupabaseClient, id: string) => {
  const res = await client.from("user_profiles").select("id").eq("id", id).single()
  return !res?.data?.id
}

const accountCreationSteps: Step[] = [
  {
    id: 0,
    title: "Let&apos;s set up your username",
    status: "current",
    Component: Step1,
  },
  {
    id: 1,
    title: "Let&apos;s set up your avatar",
    status: "incomplete",
    Component: Step2,
  },
  {
    id: 2,
    title: "Let&apos;s set up your bio",
    status: "incomplete",
    Component: Step3,
  },
]

export const getServerSideProps = async (ctxt: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient<Database>(ctxt)

  // For convinience we use the email to extract an initial username.
  // This username is used only for fetching a default avatar in the component later.
  const {
    data: { user: loggedUser },
  } = await supabase.auth.getUser()

  let isNewUser = false
  let username: string | undefined

  if (loggedUser) {
    isNewUser = await fetchUserIdWithId(supabase, loggedUser.id)

    if (isNewUser) {
      username = loggedUser?.email?.split("@")[0]

      return {
        props: {
          username,
        },
      }
    }

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  }
}

type WelcomePageProps = {
  username: string
}

export type ProfileData = {
  username: string
  avatar_url: string
  bio: string
}

export default function WelcomePage({ username }: WelcomePageProps) {
  const { data: avatarBlob, refetch: generateAvatar } = useGenDefaultAvatar(username)
  const supabase = useSupabaseClient<Database>()

  const router = useRouter()

  // Avatar blob from step 2 if the user upload an avatar from a file.
  // The reason we convert the blob here is to have control of the url
  // and revoke it when we are done with the profile creation steps.
  const [avatarBlobFromStep2, setAvatarBlobFromStep2] = useState<Blob | null>(null)

  const user = useUser()
  const [steps, setSteps] = useState(accountCreationSteps)

  // The data that will be sent to the db
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    avatar_url: user?.user_metadata.avatar_url || "",
    bio: "",
  })

  // Submission mutation
  const profileMutation = useCreateProfile(supabase)

  // Navigation (go back, next button)
  const [shouldShowGoBack, setShouldShowGoBack] = useState(false)
  const [canMoveToNextStep, setCanMoveToNextStep] = useState(false)

  // Set avatar_url to provider avatar or generate a custom one
  useEffect(() => {
    const providerAvatar = user?.user_metadata.avatar_url
    if (user && !providerAvatar) {
      generateAvatar()
    } else if (user && providerAvatar) {
      setProfileData((prev) => ({
        ...prev,
        avatar_url: providerAvatar,
      }))
    }
  }, [user, generateAvatar])

  // Handle avatar blobs
  useEffect(() => {
    let url = ""

    if (avatarBlob) {
      url = URL.createObjectURL(avatarBlob)
      setAvatarBlobFromStep2(avatarBlob)
    }
    if (avatarBlobFromStep2) {
      url = URL.createObjectURL(avatarBlobFromStep2)
      setAvatarBlobFromStep2(avatarBlobFromStep2)
    }

    setProfileData((prev) => {
      return {
        ...prev,
        avatar_url: url,
      }
    })
    return () => URL.revokeObjectURL(url)
  }, [avatarBlob, avatarBlobFromStep2])

  // Navigation effects
  useEffect(() => {
    // Checks if we are on the first step. (if we are, we don't show the `go back` button)
    setShouldShowGoBack(() => steps.findIndex((step) => step.status === "current") !== 0)
  }, [steps])

  // From step 1 we can move to step 2 if the profileData.username is not empty.
  // Any validation should be done in the Step component that sets the profileData
  useEffect(() => setCanMoveToNextStep(Boolean(profileData.username)), [profileData.username])

  const stepInformation = `Step ${
    steps.findIndex((step) => step.status === "current") === -1
      ? steps.length
      : steps.findIndex((step) => step.status === "current") + 1
  } of ${steps.length}`

  const isLastStep = steps.findIndex((step) => step.status === "incomplete") === -1

  // Next button handler
  const handleNextClick = () => {
    if (isLastStep) {
      profileMutation.mutate({
        profileData,
        id: user!.id,
        avatarBlob: avatarBlobFromStep2!,
      })

      router.push("/?fromWelcome=true")
    }

    setSteps((prev) => {
      const currentStep = prev.findIndex((step) => step.status === "current")
      const nextStep = prev.findIndex((step) => step.status === "incomplete")
      if (nextStep === -1) {
        return prev.map((step, idx) =>
          idx === currentStep ? { ...step, status: "complete" } : step
        )
      }

      return prev.map((step, idx) =>
        idx === currentStep
          ? { ...step, status: "complete" }
          : idx === nextStep
          ? { ...step, status: "current" }
          : step
      )
    })
  }

  // Go back button handler
  const handleGoBackClick = () => {
    setSteps((prev) => {
      const currentStep = prev.findIndex((step) => step.status === "current")
      const prevStep = prev.findLastIndex((step) => step.status === "complete")

      return prev.map((step, idx) =>
        idx === currentStep
          ? { ...step, status: "incomplete" }
          : idx === prevStep
          ? { ...step, status: "current" }
          : step
      )
    })
  }

  return (
    <div className="flex justify-center">
      <div className="relative top-12 w-full max-w-xl rounded-md border border-zinc-200 px-8 py-6 dark:border-zinc-700 sm:top-24">
        <div className="mb-6 flex flex-col items-center sm:mb-10">
          <p>{stepInformation}</p>
          <div className="mt-4 flex gap-3">
            {steps.map((step, idx) => (
              <Fragment key={idx}>
                {step.status === "complete" ? (
                  <div className="block h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
                ) : step.status === "current" ? (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                      <span className="h-full w-full rounded-full bg-indigo-200 dark:bg-zinc-200" />
                    </span>
                    <span
                      className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="block h-2.5 w-2.5 rounded-full bg-indigo-300 dark:bg-zinc-100"></div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
        {steps.map((step, idx) => (
          <Fragment key={idx}>
            {step.status === "current" && (
              <step.Component
                setBlobAvatar={setAvatarBlobFromStep2}
                data={profileData}
                setData={setProfileData}
              />
            )}
          </Fragment>
        ))}
        <div className="mt-16 flex w-full justify-between">
          <button
            disabled={!shouldShowGoBack}
            onClick={handleGoBackClick}
            className="select-none rounded-md bg-zinc-200 px-4 py-2 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700
            dark:hover:bg-zinc-600"
          >
            Go Back
          </button>
          <button
            disabled={!canMoveToNextStep}
            onClick={handleNextClick}
            className="select-none rounded-md bg-indigo-600 px-4 py-2 text-zinc-50 hover:bg-indigo-500 disabled:cursor-not-allowed 
          disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {steps.findIndex((step) => step.status === "current") === steps.length - 1
              ? "Finish"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
