import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import LightsControl from './LightsControl';
import CameraControl from './CameraControl';
import MannequinControl from './MannequinControl';

const NewEditorPanel = ({ mockData }) => {
  return (
    <div className="w-96 bg-background border-l h-full flex flex-col py-1.5 rounded-t-2xl">
      <Tabs defaultValue="lights" className="flex-grow flex flex-col px-1 py-1">
        <TabsList className="w-full justify-around h-10">
          <TabsTrigger value="lights" className="flex-1 h-full">조명</TabsTrigger>
          <TabsTrigger value="mannequin" className="flex-1 h-full">마네킹</TabsTrigger>
          <TabsTrigger value="camera" className="flex-1 h-full">카메라</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-grow">
          <TabsContent value="lights" className="p-4">
            <LightsControl lights={mockData.lights} />
          </TabsContent>
          <TabsContent value="mannequin" className="p-4">
            <MannequinControl mannequins={mockData.mannequins} selectedId={mockData.selectedMannequinId} />
          </TabsContent>
          <TabsContent value="camera" className="p-4">
            <CameraControl camera={mockData.camera} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default NewEditorPanel;
