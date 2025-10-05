import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import LightsControl from './editor/LightsControl';
import CameraControl from './editor/CameraControl';
import MannequinControl from './editor/MannequinControl';

const EditorPanel = () => {
  return (
    <div className="w-96 bg-background border-l h-full flex flex-col py-1.5 px-2 rounded-tl-xl overflow-scroll">
      <Tabs defaultValue="lights" className="flex-grow flex flex-col">
        <TabsList className="w-full justify-around h-10">
          <TabsTrigger value="lights" className="flex-1 py-3 h-full">조명</TabsTrigger>
          <TabsTrigger value="mannequin" className="flex-1 py-3 h-full">마네킹</TabsTrigger>
          <TabsTrigger value="camera" className="flex-1 py-3 h-full">카메라</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-grow">
          <TabsContent value="lights" className="p-4">
            <LightsControl />
          </TabsContent>
          <TabsContent value="mannequin" className="p-4">
            <MannequinControl />
          </TabsContent>
          <TabsContent value="camera" className="p-4">
            <CameraControl />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EditorPanel;
