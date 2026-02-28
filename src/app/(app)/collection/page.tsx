import { Collection } from "@/modules/collection";
import { getDocuments } from "./actions";

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  const result = await getDocuments();

  return (
    <Collection
      initialDocuments={result.success ? result.documents || [] : []}
    />
  );
}
