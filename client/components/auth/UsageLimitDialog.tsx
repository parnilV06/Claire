import { Link } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UsageLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureLabel: string;
};

export function UsageLimitDialog({ open, onOpenChange, featureLabel }: UsageLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Free limit reached</DialogTitle>
          <DialogDescription>
            You have used the free {featureLabel} limit. Log in or create an account to unlock more.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Link to="/login">
            <Button>Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary">Sign up</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
