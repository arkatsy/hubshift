import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { getSession } from "@/lib/helpers"
import { useForm } from "react-hook-form"
import { Brand, LoadingSpinner, Icons } from "@/components"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import type { Database } from "@/lib/dbtypes"
import type { AuthError, SupabaseClient } from "@supabase/supabase-js"

type LoginPageProps = {}

export const getServerSideProps: GetServerSideProps<LoginPageProps> = async (ctxt) => {
  const session = await getSession(ctxt)

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

const emailLoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required()

enum Providers {
  Google = "google",
  Github = "github",
  Discord = "discord",
  Email = "email",
}

type OAuthProviders = Exclude<Providers, Providers.Email>

type EmailLogin = z.infer<typeof emailLoginSchema>

type OAuthProviderUI = {
  name: OAuthProviders
  icon: JSX.Element
  loginType: {
    provider: OAuthProviders
  }
}

const oathProviders: OAuthProviderUI[] = [
  {
    name: Providers.Google,
    icon: <Icons.GoogleIcon />,
    loginType: {
      provider: Providers.Google,
    },
  },
  {
    name: Providers.Github,
    icon: <Icons.GithubIcon />,
    loginType: {
      provider: Providers.Github,
    },
  },
  {
    name: Providers.Discord,
    icon: <Icons.DiscordIcon />,
    loginType: {
      provider: Providers.Discord,
    },
  },
]

const links = [
  {
    name: "Forgot Your Password?",
    href: "/auth/forgot-password",
  },
  {
    name: "Create Account",
    href: "/auth/register",
  },
]

export default function LoginPage({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { register, handleSubmit, formState, setError, clearErrors } = useForm<EmailLogin>({
    resolver: zodResolver(emailLoginSchema),
  })
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()

  const [isLoading, setIsLoading] = useState(false)

  const onLoginSubmit = async (data: EmailLogin) => {
    setIsLoading(true)
    const authReport = await loginWithProvider(supabase, {
      provider: Providers.Email,
      formData: data,
    })
    setIsLoading(false)
    if (authReport.status === AuthResponseStatus.Success) {
      router.push("/")
    } else {
      setError("root", { message: authReport.message })
    }
  }

  return (
    <main className="auth-page-layout">
      <div className="hidden select-none text-center sm:block">
        <span className="text-4xl font-bold">Welcome To</span>
        <Brand isLink={false} className="-mt-1 mb-8 text-4xl" />
      </div>
      <div className="flex w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-100 px-6 py-8 dark:border-zinc-600 dark:bg-zinc-800 sm:max-w-lg">
        <form onSubmit={handleSubmit(onLoginSubmit)} className="flex basis-full flex-col gap-8">
          {/* Email field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="text-lg">
              Email
            </label>
            <input
              type="email"
              id="email"
              autoCapitalize="off"
              autoComplete="email"
              className="auth-page-input"
              placeholder="Enter your email"
              defaultValue=""
              spellCheck={false}
              onFocus={() => clearErrors("root")}
              {...register("email", {
                required: true,
                pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              })}
            />
            {formState.errors.email && <span className="text-red-500">This field is required</span>}
          </div>
          {/* Password field */}
          <div className="flex flex-col gap-3">
            <label htmlFor="password" className="text-lg">
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="auth-page-input"
              placeholder="Enter your password"
              defaultValue=""
              onFocus={() => clearErrors("root")}
              {...register("password", { required: true })}
            />
            {formState.errors.password && (
              <span className="text-red-500">This field is required</span>
            )}
          </div>
          {/* Submit button */}
          <div className="flex basis-full flex-col gap-3">
            {formState.errors.root && (
              <span className="-mt-4 text-center text-red-500">
                {formState.errors.root.message}
              </span>
            )}
            <button type="submit" className="auth-page-submit">
              <span className="flex justify-center">
                {isLoading ? <LoadingSpinner /> : "Log In"}
              </span>
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {/* Divider */}
            <div className="auth-page-divider -mt-2 mb-4" />
            {/* Providers */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              {oathProviders.map((provider, idx) => (
                <button
                  key={idx}
                  className="auth-page-provider flex w-full justify-center"
                  title={`Sign in with ${provider.name}`}
                  onClick={(e) => {
                    e.preventDefault()
                    loginWithProvider(supabase, provider.loginType)
                  }}
                >
                  <span aria-hidden="true">{provider.icon}</span>
                  <span className="sr-only">Sign in with {provider.name}</span>
                </button>
              ))}
            </div>
            {/* Links */}
            <div className="mt-4 flex flex-col gap-2">
              {links.map((link, idx) => (
                <Link key={idx} href={link.href} className="auth-page-link">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

type LoginProviderOpts =
  | {
      provider: OAuthProviders
    }
  | {
      provider: Providers.Email
      formData: EmailLogin
    }

async function loginWithProvider(client: SupabaseClient, providerOpts: LoginProviderOpts) {
  if ("formData" in providerOpts) {
    const { data, error } = await client.auth.signInWithPassword(providerOpts.formData)
    return createAuthReport(data, error, Providers.Email)
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider: providerOpts.provider,
  })

  return createAuthReport(data, error, providerOpts.provider)
}

const enum AuthResponseStatus {
  Success = "success",
  Error = "error",
}

type AuthReport = {
  status: AuthResponseStatus
  message: string
}

function createAuthReport<T>(data: T, error: AuthError | null, type: Providers): AuthReport {
  if (error) {
    return {
      status: AuthResponseStatus.Error,
      message: error.message,
    }
  }

  if (!error && !data) {
    return {
      status: AuthResponseStatus.Error,
      message: "Something went wrong. Please Try again later",
    }
  }

  return {
    status: AuthResponseStatus.Success,
    message: `Logged in successfully with ${type}`,
  }
}
