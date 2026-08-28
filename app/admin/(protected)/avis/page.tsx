import ReviewsManager from "@/components/admin/ReviewsManager";

export default function AdminAvisPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Avis clients</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gérez les avis reçus par formulaire et ajoutez ceux que vous recevez ailleurs.
      </p>
      <div className="mt-6">
        <ReviewsManager />
      </div>
    </div>
  );
}
