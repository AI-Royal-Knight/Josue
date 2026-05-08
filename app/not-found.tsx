import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div>
      <CardContent className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur md:p-10">
          <p className="text-xs font-semibold tracking-[0.24em] text-emerald-300 uppercase">
            Error 404
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            The page you are looking for does not exist or was moved. Use one of
            the options below to continue.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/home"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      </CardContent>
    </div>
  )
}
