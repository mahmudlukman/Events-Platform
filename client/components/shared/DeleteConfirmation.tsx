import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDeleteEventMutation } from "../../redux/features/event/eventApi";

interface DeleteConfirmationProps {
  eventId: string;
  eventName?: string;
  onDeleteSuccess?: () => void;
}

const DeleteConfirmation = ({
  eventId,
  eventName = "this event",
  onDeleteSuccess,
}: DeleteConfirmationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteEvent, { isLoading }] = useDeleteEventMutation();

  const handleDelete = async () => {
    try {
      await deleteEvent({ eventId }).unwrap();

      toast.success(`${eventName} has been deleted.`, {
        duration: 3000,
      });

      setIsOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while deleting the event.";

      toast.error(errorMessage, {
        duration: 5000,
      });

      console.error("Failed to delete event:", err);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100 transition-colors"
          aria-label="Delete event"
        >
          <Image
            src="/assets/icons/delete.svg"
            alt="delete"
            width={20}
            height={20}
          />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-grey-600">
            This action cannot be undone. {eventName} will be permanently
            deleted from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="hover:bg-gray-100">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation;
