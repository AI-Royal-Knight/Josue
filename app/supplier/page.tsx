import SupplierForm from "./_components/SupplierForm"

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">
          Supplier Invoice Portal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your invoices securely. Please ensure all reference numbers are
          accurate.
        </p>

        <div className="mt-6">
          <SupplierForm />
        </div>
      </div>
    </div>
  )
}
