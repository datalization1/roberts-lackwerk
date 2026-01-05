import { useMe } from "../api/auth";

export function useAdminAuth() {
  const { data } = useMe();
  const isAuthed = !!data?.is_staff;
  return { isAuthed };
}
