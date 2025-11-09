import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import useStore from "../../store/editorStore";
import { standPose, sitPose } from "../../presets";

const BoneSlider = ({ boneName, axis, value, mannequinId }) => {
  const { setBoneRotation } = useStore();

  // [Architecture 시나리오 1: UI 슬라이더로 뼈 회전]
  // 1. User → EditorPanel (슬라이더 조작)
  // 2. handleValueChange → setBoneRotation 액션 호출
  // 3. Zustand Store → mannequins.pose 상태 변경
  // 4. Mannequin.jsx → pose 변경 감지하여 3D 모델 업데이트
  // 참고: docs/LumoStage-Architecture.md 시나리오 1
  const handleValueChange = (v) => {
    setBoneRotation(mannequinId, boneName, axis, v);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${boneName}-${axis}`} className="capitalize text-xs">
        {axis} Axis
      </Label>
      <div className="flex items-center gap-2">
        <Slider
          id={`${boneName}-${axis}`}
          value={[value]}
          max={Math.PI}
          min={-Math.PI}
          step={0.01}
          onValueChange={(v) => handleValueChange(v[0])}
          className="flex-1"
        />
        <Input
          type="number"
          value={value.toFixed(2)}
          onChange={(e) => handleValueChange(parseFloat(e.target.value))}
          className="w-20 h-8"
        />
      </div>
    </div>
  );
};

const boneGroups = {
  "머리 & 허리": ["head_02", "waist_00"],
  왼팔: ["l_shoulder_03", "l_forearm_04", "l_hand_05"],
  오른팔: ["r_shoulder_06", "r_forearm_07", "r_hand_08"],
  왼다리: ["l_thigh_09", "l_shin_010", "l_foot_012"],
  오른다리: ["r_thigh_013", "r_shin_014", "r_foot_016"],
};

const boneLabels = {
  head_02: "머리",
  waist_00: "허리",
  l_shoulder_03: "왼쪽 어깨",
  l_forearm_04: "왼쪽 팔뚝",
  l_hand_05: "왼쪽 손",
  r_shoulder_06: "오른쪽 어깨",
  r_forearm_07: "오른쪽 팔뚝",
  r_hand_08: "오른쪽 손",
  l_thigh_09: "왼쪽 허벅지",
  l_shin_010: "왼쪽 정강이",
  l_foot_012: "왼쪽 발",
  r_thigh_013: "오른쪽 허벅지",
  r_shin_014: "오른쪽 정강이",
  r_foot_016: "오른쪽 발",
};

const MannequinControl = () => {
  const {
    mannequins,
    selectedMannequinId,
    selectMannequin,
    addMannequin,
    deleteMannequin,
    applyPosePreset,
    highlightedBone,
  } = useStore();

  const [openAccordion, setOpenAccordion] = useState("머리 & 허리");

  useEffect(() => {
    if (highlightedBone) {
      for (const [groupName, boneNames] of Object.entries(boneGroups)) {
        if (boneNames.includes(highlightedBone)) {
          setOpenAccordion(groupName);
          break;
        }
      }
    }
  }, [highlightedBone]);

  const selectedMannequin = mannequins.find(
    (m) => m.id === selectedMannequinId
  );
  const pose = selectedMannequin?.pose || {};

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-medium">마네킹 선택</h3>
        <div className="flex gap-2">
          <Select
            value={selectedMannequinId || ""}
            onValueChange={selectMannequin}
          >
            <SelectTrigger>
              <SelectValue placeholder="마네킹 선택" />
            </SelectTrigger>
            <SelectContent>
              {mannequins.map((m, i) => (
                <SelectItem key={m.id} value={m.id}>
                  마네킹 {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addMannequin}>추가</Button>
          <Button
            variant="destructive"
            onClick={() => deleteMannequin(selectedMannequinId)}
            disabled={!selectedMannequinId}
          >
            삭제
          </Button>
        </div>
      </div>

      {selectedMannequin && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">포즈 프리셋</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => applyPosePreset(selectedMannequinId, standPose)}
              >
                서기
              </Button>
              <Button
                variant="outline"
                onClick={() => applyPosePreset(selectedMannequinId, sitPose)}
              >
                앉기
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-4">관절 제어</h3>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={openAccordion}
              onValueChange={setOpenAccordion}
            >
              {Object.entries(boneGroups).map(([groupName, boneNames]) => (
                <AccordionItem key={groupName} value={groupName}>
                  <AccordionTrigger>{groupName}</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {boneNames.map(
                      (boneName) =>
                        pose[boneName] && (
                          <div
                            key={boneName}
                            className="space-y-3 p-3 bg-muted/50 rounded-md"
                          >
                            <Label className="font-semibold">
                              {boneLabels[boneName]}
                            </Label>
                            <BoneSlider
                              boneName={boneName}
                              axis="x"
                              value={pose[boneName].x}
                              mannequinId={selectedMannequinId}
                            />
                            <BoneSlider
                              boneName={boneName}
                              axis="y"
                              value={pose[boneName].y}
                              mannequinId={selectedMannequinId}
                            />
                            <BoneSlider
                              boneName={boneName}
                              axis="z"
                              value={pose[boneName].z}
                              mannequinId={selectedMannequinId}
                            />
                          </div>
                        )
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground pt-4">
        Based on "Wooden Mannequin" by madeofmesh, licensed under CC-BY-4.0.
      </p>
    </div>
  );
};

export default MannequinControl;
