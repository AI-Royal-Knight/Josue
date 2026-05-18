export default function ErrorMessage({ message }: { message?: string | null }) {
  return (
    <div className="text-xs text-red-500 mt-2">{message}</div>
  )
}
