import { redirect } from "next/navigation";

// /parametres has no content of its own — it opens on the Ingrédients catalog.
export default function SettingsIndexPage() {
  redirect("/parametres/ingredients");
}
