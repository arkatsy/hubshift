import { useRouter } from "next/router"

export default function UserProfilePage() {
  const router = useRouter()

  return (
    <div className="">
      <h1>{router.query.username}</h1>
    </div>
  )
}
