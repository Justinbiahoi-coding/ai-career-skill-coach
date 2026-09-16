import { redirect } from "next/navigation";

// /home was folded into / — this stays only so any bookmark or link still
// pointing at the old path lands somewhere real instead of a 404.
export default function HomeRedirect() {
  redirect("/");
}
