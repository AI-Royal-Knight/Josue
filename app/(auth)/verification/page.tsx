import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"

export const metadata = {
  title: "Verification",
}

const otpFields = Array.from({ length: 5 }, (_, index) => index)

export default function Page() {
  return (
    <AuthCard
      title="Verification"
      subtitle="We sent a 5-digit code to star***@gmail.com"
    >
      <div className="flex items-center justify-center gap-3">
        {otpFields.map((index) => (
          <Input
            key={index}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            className="h-12 w-12 rounded-md border-white/40 bg-transparent text-center text-base text-white"
          />
        ))}
      </div>

      <Button className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase">
        Continue
      </Button>
    </AuthCard>
  )
}
