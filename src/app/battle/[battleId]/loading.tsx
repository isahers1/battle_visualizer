export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-stone-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-stone-700" />
        <div className="text-sm text-stone-500">Loading battle...</div>
      </div>
    </div>
  );
}
