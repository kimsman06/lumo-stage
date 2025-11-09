import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import LightsControl from './editor/LightsControl';
import CameraControl from './editor/CameraControl';
import MannequinControl from './editor/MannequinControl';
import DiffuserControl from './editor/DiffuserControl';
import AssetControl from './editor/AssetControl';

const EditorPanel = ({ projectId }) => {
  return (
    <div className="w-96 bg-background border-l h-full flex flex-col overflow-hidden">
      <Tabs defaultValue="lights" className="h-full flex flex-col">
        {/* TabsList - 고정 높이, shrink 방지 */}
        <div className="flex-shrink-0 p-2">
          <TabsList className="w-full justify-around h-10">
            <TabsTrigger value="lights" className="flex-1 py-3 h-full text-xs">조명</TabsTrigger>
            <TabsTrigger value="diffuser" className="flex-1 py-3 h-full text-xs">디퓨저</TabsTrigger>
            <TabsTrigger
              value="mannequin"
              className="flex-1 py-3 h-full text-xs"
              data-tutorial="mannequin-tab"
            >
              마네킹
            </TabsTrigger>
            <TabsTrigger
              value="camera"
              className="flex-1 py-3 h-full text-xs"
              data-tutorial="camera-tab"
            >
              카메라
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex-1 py-3 h-full text-xs">
              에셋
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TabsContent - 스크롤 영역 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <TabsContent value="lights" className="p-4 m-0">
              <LightsControl />
            </TabsContent>
            <TabsContent value="diffuser" className="p-4 m-0">
              <DiffuserControl />
            </TabsContent>
            <TabsContent value="mannequin" className="p-4 m-0">
              <MannequinControl />
            </TabsContent>
            <TabsContent value="camera" className="p-4 m-0">
              <CameraControl />
            </TabsContent>
            <TabsContent value="assets" className="p-4 m-0">
              <AssetControl projectId={projectId} />
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

export default EditorPanel;
