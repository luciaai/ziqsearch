"use client";

import React, { useState } from "react";
import { ChatHistoryDialog } from "@/components/chat-history-dialog";
import { useUserData } from "@/hooks/use-user-data";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { data: user } = useUserData();
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center pt-24 px-4">
      <ChatHistoryDialog open={open} onOpenChange={handleClose} user={user ?? null} />
    </div>
  );
}
