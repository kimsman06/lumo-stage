/**
 * PrevisualizationPanel
 *
 * AI 프리비주얼 생성 패널
 * - API 키 설정
 * - 프롬프트 입력 및 파라미터 조정
 * - 생성 진행 상태 표시
 * - 히스토리 관리
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle,
  Info,
  Zap,
  Crown,
} from "lucide-react";
import { captureScene, downloadImage } from "@/lib/captureScene";
import aiApi from "@/lib/aiApi";
import toast from "@/lib/toast";
import useEditorStore from "@/store/editorStore";

// 기본 파라미터 값
const DEFAULT_PARAMS = {
  strength: 0.75,
  steps: 30,
  guidanceScale: 7.5,
};

// AI 모델 옵션
const MODEL_OPTIONS = [
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash",
    description: "빠른 속도, 1024px 해상도",
    icon: Zap,
  },
  {
    id: "gemini-3-pro-image-preview",
    name: "Gemini 3 Pro (Preview)",
    description: "고품질, 4K 지원, Thinking 모드",
    icon: Crown,
  },
];

const PrevisualizationPanel = ({ projectId, readOnly = false }) => {
  // API 키 상태
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingApiKey, setSavingApiKey] = useState(false);

  // 프롬프트 상태
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [negativePromptOpen, setNegativePromptOpen] = useState(false);

  // 모델 선택 상태
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-image");

  // 파라미터 상태
  const [strength, setStrength] = useState(DEFAULT_PARAMS.strength);
  const [steps, setSteps] = useState(DEFAULT_PARAMS.steps);
  const [guidanceScale, setGuidanceScale] = useState(DEFAULT_PARAMS.guidanceScale);

  // 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationId, setCurrentGenerationId] = useState(null);

  // 히스토리 상태
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);

  // 비교 뷰 상태
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonImage, setComparisonImage] = useState(null);

  // 사용량 통계
  const [usageStats, setUsageStats] = useState(null);

  const aspectRatio = useEditorStore((state) => state.aspectRatio);

  // API 키 상태 확인
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  // 히스토리 로드
  useEffect(() => {
    if (projectId && hasApiKey) {
      loadHistory();
    }
  }, [projectId, hasApiKey]);

  const checkApiKeyStatus = async () => {
    try {
      const result = await aiApi.getApiKeyStatus();
      setHasApiKey(result.hasApiKey);
    } catch (error) {
      console.error("API 키 상태 확인 실패:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error("API 키를 입력해주세요");
      return;
    }

    setSavingApiKey(true);
    try {
      await aiApi.saveApiKey(apiKeyInput);
      setHasApiKey(true);
      setApiKeyDialogOpen(false);
      setApiKeyInput("");
      toast.success("API 키가 저장되었습니다");
      loadHistory();
      loadUsageStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "API 키 저장에 실패했습니다");
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      await aiApi.deleteApiKey();
      setHasApiKey(false);
      setHistory([]);
      toast.success("API 키가 삭제되었습니다");
    } catch (error) {
      toast.error("API 키 삭제에 실패했습니다");
    }
  };

  const loadHistory = async () => {
    if (!projectId) return;

    setLoadingHistory(true);
    try {
      const result = await aiApi.getPrevisualizations({
        projectId,
        limit: 20,
      });
      setHistory(result.items || []);
    } catch (error) {
      console.error("히스토리 로드 실패:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await aiApi.getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error("사용량 통계 로드 실패:", error);
    }
  };

  // 생성 상태 폴링
  const pollGenerationStatus = useCallback(async (id) => {
    try {
      const result = await aiApi.getPrevisualizationStatus(id);

      if (result.status === "completed") {
        setIsGenerating(false);
        setGenerationProgress(100);
        setCurrentGenerationId(null);
        toast.success("프리비주얼이 생성되었습니다");
        loadHistory();
        loadUsageStats();
      } else if (result.status === "failed") {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentGenerationId(null);
        toast.error(result.error || "생성에 실패했습니다");
      } else {
        // 진행 중
        setGenerationProgress(result.progress || 50);
        setTimeout(() => pollGenerationStatus(id), 2000);
      }
    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGenerationId(null);
      toast.error("생성 상태 확인에 실패했습니다");
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요");
      return;
    }

    if (!hasApiKey) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      // 씬 캡처
      const image = await captureScene({
        format: "png",
        cropToAspect: true,
        aspectRatio,
      });
      setComparisonImage(image);

      // 생성 요청
      const result = await aiApi.createPrevisualization({
        projectId,
        image,
        prompt,
        negativePrompt,
        strength,
        steps,
        guidanceScale,
        aspectRatio,
        model: selectedModel,
      });

      setCurrentGenerationId(result.id);
      setGenerationProgress(30);

      // 상태 폴링 시작
      pollGenerationStatus(result.id);
    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);

      if (error.response?.status === 429) {
        toast.error("Rate limit 초과. 잠시 후 다시 시도해주세요.");
      } else {
        toast.error(error.response?.data?.message || "생성 요청에 실패했습니다");
      }
    }
  };

  const handleIterate = async (previewId) => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const result = await aiApi.iteratePrevisualization(previewId, {
        prompt,
        negativePrompt,
        strength,
        steps,
        guidanceScale,
        aspectRatio,
        model: selectedModel,
      });

      setCurrentGenerationId(result.id);
      setGenerationProgress(30);
      pollGenerationStatus(result.id);
    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      toast.error(error.response?.data?.message || "재생성 요청에 실패했습니다");
    }
  };

  const handleDelete = async (previewId) => {
    try {
      await aiApi.deletePrevisualization(previewId);
      setHistory((prev) => prev.filter((item) => item.id !== previewId));
      if (selectedPreview?.id === previewId) {
        setSelectedPreview(null);
      }
      toast.success("삭제되었습니다");
    } catch (error) {
      toast.error("삭제에 실패했습니다");
    }
  };

  const handleDownload = (item, format = "png") => {
    if (!item.resultImage) return;

    const filename = `previsualization-${item.id}.${format}`;
    downloadImage(item.resultImage, filename);
    toast.success("다운로드가 시작되었습니다");
  };

  const cancelGeneration = () => {
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentGenerationId(null);
  };

  if (readOnly) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        읽기 전용 모드에서는 AI 프리비주얼을 사용할 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI 프리비주얼
        </h3>
        <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API 키 설정</DialogTitle>
              <DialogDescription>
                AI 이미지 생성을 위한 API 키를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                </div>
              </div>
              {hasApiKey && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  API 키가 등록되어 있습니다
                </div>
              )}
              {usageStats && (
                <div className="text-sm text-muted-foreground">
                  이번 달 사용량: {usageStats.thisMonth || 0}회 /
                  {usageStats.limit || "무제한"}
                </div>
              )}
            </div>
            <DialogFooter>
              {hasApiKey && (
                <Button variant="destructive" onClick={handleDeleteApiKey}>
                  삭제
                </Button>
              )}
              <Button onClick={handleSaveApiKey} disabled={savingApiKey}>
                {savingApiKey ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API 키 미등록 경고 */}
      {!hasApiKey && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-md text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>API 키를 등록해주세요</span>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-yellow-600"
            onClick={() => setApiKeyDialogOpen(true)}
          >
            설정
          </Button>
        </div>
      )}

      <Separator />

      {/* 모델 선택 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>AI 모델</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[250px]">
                <p className="text-xs">
                  Flash: 빠른 생성 속도로 테스트에 적합<br />
                  Pro: 높은 품질과 4K 해상도 지원
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isGenerating}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((model) => {
              const Icon = model.icon;
              return (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* 프롬프트 입력 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt">프롬프트</Label>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <HelpCircle className="w-3 h-3 mr-1" />
                가이드
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>프롬프트 작성 가이드</SheetTitle>
                <SheetDescription>
                  효과적인 AI 이미지 생성을 위한 프롬프트 작성법
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* 시스템 자동 처리 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">시스템이 자동으로 처리하는 내용</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>마네킹/더미를 실제 인물로 대체</li>
                    <li>카메라 프레이밍, 초점거리, 구도 유지</li>
                    <li>HDRI 환경 맵의 조명과 반사 재현</li>
                  </ul>
                </div>

                {/* 작성 팁 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">프롬프트 작성 팁</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">1. 장면 설명 우선</p>
                      <p className="text-muted-foreground text-xs">
                        키워드 나열 대신 "누가-어디서-무엇을-어떻게" 구조로 서술
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">2. 맥락 명시</p>
                      <p className="text-muted-foreground text-xs">
                        결과물 용도를 포함하면 일관성 향상 (예: 패션 화보, 영화 포스터)
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">3. 카메라/스타일/광원 명시</p>
                      <p className="text-muted-foreground text-xs">
                        촬영 용어 활용 (렌즈, 조리개, 조명 타입, 무드)
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">4. 부정 지침은 긍정형으로</p>
                      <p className="text-muted-foreground text-xs">
                        "차 없는 거리" 대신 원하는 상태를 직접 서술
                      </p>
                    </div>
                  </div>
                </div>

                {/* 템플릿 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">시나리오별 템플릿</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-2 bg-muted rounded-md">
                      <p className="font-medium text-xs mb-1">포토리얼</p>
                      <p className="text-xs text-muted-foreground">
                        "A photorealistic [shot type] of [subject], [action], set in [environment]. Lit by [light], captured with [lens], mood is [mood]."
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <p className="font-medium text-xs mb-1">시네마틱</p>
                      <p className="text-xs text-muted-foreground">
                        "[Character description], [action/expression], [environment]. [Lighting description], [camera angle/lens]. [mood/atmosphere]."
                      </p>
                    </div>
                  </div>
                </div>

                {/* 네거티브 프롬프트 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">네거티브 프롬프트 예시</h4>
                  <p className="text-xs text-muted-foreground">
                    기본 제외 항목: plastic skin, mannequin, doll-like eyes, distorted lens, extreme fisheye, incorrect framing
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Textarea
          id="prompt"
          placeholder="원하는 조명 효과를 설명하세요..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] text-sm"
          disabled={isGenerating}
        />
      </div>

      {/* 네거티브 프롬프트 (접기/펼치기) */}
      <Collapsible open={negativePromptOpen} onOpenChange={setNegativePromptOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            네거티브 프롬프트
            {negativePromptOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            placeholder="제외할 요소를 입력하세요..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="min-h-[60px] text-sm"
            disabled={isGenerating}
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* 파라미터 슬라이더 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">파라미터</h4>

        {/* Strength */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Strength</Label>
            <span className="text-muted-foreground">{strength.toFixed(2)}</span>
          </div>
          <Slider
            value={[strength]}
            onValueChange={([v]) => setStrength(v)}
            min={0.1}
            max={1.0}
            step={0.05}
            disabled={isGenerating}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Steps</Label>
            <span className="text-muted-foreground">{steps}</span>
          </div>
          <Slider
            value={[steps]}
            onValueChange={([v]) => setSteps(v)}
            min={10}
            max={50}
            step={1}
            disabled={isGenerating}
          />
        </div>

        {/* Guidance Scale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Guidance Scale</Label>
            <span className="text-muted-foreground">{guidanceScale.toFixed(1)}</span>
          </div>
          <Slider
            value={[guidanceScale]}
            onValueChange={([v]) => setGuidanceScale(v)}
            min={1}
            max={20}
            step={0.5}
            disabled={isGenerating}
          />
        </div>
      </div>

      <Separator />

      {/* 생성 버튼 및 진행 상태 */}
      {isGenerating ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">생성 중...</span>
            <Button variant="ghost" size="sm" onClick={cancelGeneration}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={generationProgress} />
        </div>
      ) : (
        <Button
          onClick={handleGenerate}
          className="w-full"
          disabled={!prompt.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          프리비주얼 생성
        </Button>
      )}

      <Separator />

      {/* 히스토리 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">히스토리</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHistory}
            disabled={loadingHistory}
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingHistory ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {history.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            생성된 프리비주얼이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${
                  selectedPreview?.id === item.id
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
                onClick={() => setSelectedPreview(item)}
              >
                <img
                  src={item.thumbnailUrl || item.resultImage}
                  alt={item.prompt}
                  className="w-full h-full object-cover"
                />
                {item.status === "pending" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 프리뷰 상세 */}
      {selectedPreview && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">선택된 프리비주얼</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPreview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 이미지 미리보기 */}
            <div className="relative aspect-video rounded-md overflow-hidden bg-black">
              <img
                src={selectedPreview.resultImage}
                alt={selectedPreview.prompt}
                className="w-full h-full object-contain"
              />
            </div>

            {/* 프롬프트 정보 */}
            <div className="text-xs text-muted-foreground">
              <p className="line-clamp-2">{selectedPreview.prompt}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? (
                  <EyeOff className="w-4 h-4 mr-1" />
                ) : (
                  <Eye className="w-4 h-4 mr-1" />
                )}
                비교
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setPrompt(selectedPreview.prompt || "");
                  setNegativePrompt(selectedPreview.negativePrompt || "");
                  handleIterate(selectedPreview.id);
                }}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                재생성
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(selectedPreview, "png")}
              >
                <Download className="w-4 h-4 mr-1" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(selectedPreview, "jpg")}
              >
                <Download className="w-4 h-4 mr-1" />
                JPG
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedPreview.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Before/After 비교 다이얼로그 */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before / After 비교</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-center">Before</h5>
              <div className="aspect-video rounded-md overflow-hidden bg-black">
                {comparisonImage || selectedPreview?.sourceImage ? (
                  <img
                    src={comparisonImage || selectedPreview?.sourceImage}
                    alt="Before"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    원본 이미지 없음
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-center">After</h5>
              <div className="aspect-video rounded-md overflow-hidden bg-black">
                {selectedPreview?.resultImage ? (
                  <img
                    src={selectedPreview.resultImage}
                    alt="After"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    결과 이미지 없음
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrevisualizationPanel;
