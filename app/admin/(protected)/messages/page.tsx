import MessagesInbox from "@/components/admin/MessagesInbox";

export default function AdminMessagesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Messages</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Messages reçus depuis le formulaire de contact du site.
      </p>
      <div className="mt-6">
        <MessagesInbox />
      </div>
    </div>
  );
}
