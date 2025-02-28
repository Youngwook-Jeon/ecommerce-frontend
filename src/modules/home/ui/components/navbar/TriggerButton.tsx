import { LuAlignLeft } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export default function TriggerButton() {
  return (
    <Button variant="outline" className="flex gap-4 max-w-[100px]">
      <LuAlignLeft className="w-6 h-6" />
    </Button>
  );
}
