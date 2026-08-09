"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Shared logout confirmation flow (modal open + signOut + redirect).
 */
export default function useConfirmLogout({ redirectTo = "/login" } = {}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const ask = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const confirm = async () => {
    await signOut({ redirect: false });
    setIsOpen(false);
    router.push(redirectTo);
  };

  return { isOpen, ask, close, confirm };
}
