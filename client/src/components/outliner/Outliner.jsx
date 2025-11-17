import { useState } from "react";
import { Search, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import OutlinerTree from "./OutlinerTree";

const Outliner = ({ readOnly = false }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full bg-background h-full flex flex-col overflow-hidden border-b">
        <div className="flex-shrink-0 p-3 border-b">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="w-4 h-4" />
            <span>Outliner</span>
          </div>
        </div>

        <div className="flex-shrink-0 p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <OutlinerTree searchQuery={searchQuery} readOnly={readOnly} />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default Outliner;
