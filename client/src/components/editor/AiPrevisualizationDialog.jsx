/**
 * AiPrevisualizationDialog
 *
 * Dialog 안에 Sidebar가 있는 AI 프리비주얼 UI
 * shadcn sidebar-13 스타일 참고
 */

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  History,
  Settings,
  Key,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  Info,
  Zap,
  Crown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CenteredDialogContent } from "@/components/ui/centered-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  {
    id: "gemini-3.1-flash-image-preview",
    name: "Gemini 3.1 Flash (Preview)",
    description: "고품질, 구글 검색도구 활용",
    icon: Crown,
  },
];

const navItems = [
  { id: "generate", name: "생성", icon: Sparkles },
  { id: "history", name: "히스토리", icon: History },
  { id: "settings", name: "설정", icon: Settings },
];

export function AiPrevisualizationDialog({ projectId, open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("generate");

  // API 키 상태
  const [hasApiKey, setHasApiKey] = useState(false);
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
  const [guidanceScale, setGuidanceScale] = useState(
    DEFAULT_PARAMS.guidanceScale,
  );

  // 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationId, setCurrentGenerationId] = useState(null);

  // 히스토리 상태
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);

  // 비교 이미지
  const [comparisonImage, setComparisonImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // 사용량 통계
  const [usageStats, setUsageStats] = useState(null);

  const aspectRatio = useEditorStore((state) => state.aspectRatio);

  // API 키 상태 확인
  useEffect(() => {
    if (open) {
      checkApiKeyStatus();
    }
  }, [open]);

  // 히스토리 로드
  useEffect(() => {
    if (projectId && hasApiKey && open) {
      loadHistory();
      loadUsageStats();
    }
  }, [projectId, hasApiKey, open]);

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
      setApiKeyInput("");
      toast.success("API 키가 저장되었습니다");
      loadHistory();
      loadUsageStats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "API 키 저장에 실패했습니다",
      );
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
        setActiveTab("history");
      } else if (result.status === "failed") {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentGenerationId(null);
        toast.error(result.error || "생성에 실패했습니다");
      } else {
        // 서버에서 progress를 제공하면 사용, 아니면 점진적 증가
        setGenerationProgress((prev) => {
          if (result.progress) return result.progress;
          // 최대 90%까지 점진적으로 증가
          const increment = Math.random() * 5 + 2;
          return Math.min(prev + increment, 90);
        });
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
      toast.error("API 키를 먼저 등록해주세요");
      setActiveTab("settings");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const image = await captureScene({
        format: "png",
        cropToAspect: true,
        aspectRatio,
      });
      setComparisonImage(image);

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
      pollGenerationStatus(result.id);
    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);

      if (error.response?.status === 429) {
        toast.error("Rate limit 초과. 잠시 후 다시 시도해주세요.");
      } else {
        toast.error(
          error.response?.data?.message || "생성 요청에 실패했습니다",
        );
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
      toast.error(
        error.response?.data?.message || "재생성 요청에 실패했습니다",
      );
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

  // 생성 탭 컨텐츠
  const renderGenerateContent = () => (
    <div className="space-y-4">
      {/* API 키 미등록 경고 */}
      {!hasApiKey && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-md text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>API 키를 먼저 등록해주세요</span>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-yellow-600"
            onClick={() => setActiveTab("settings")}
          >
            설정으로 이동
          </Button>
        </div>
      )}

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
                  Flash: 빠른 생성 속도
                  <br />
                  Pro: 높은 품질과 4K 해상도 지원
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={isGenerating}
        >
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
                    <div className="flex flex-col text-left">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

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
            <SheetContent className="overflow-y-auto p-0">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>프롬프트 작성 가이드</SheetTitle>
                <SheetDescription>
                  효과적인 AI 이미지 생성을 위한 프롬프트 작성법
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6 px-6 pb-6 text-sm">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    시스템이 자동으로 처리하는 내용
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>마네킹/더미를 실제 인물로 대체</li>
                    <li>카메라 프레이밍, 초점거리, 구도 유지</li>
                    <li>HDRI 환경 맵의 조명과 반사 재현</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    프롬프트 작성 팁
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">1. 장면 설명 우선</p>
                      <p className="text-muted-foreground text-xs">
                        인물/오브젝트, 조명, 카메라 느낌 순으로 작성합니다.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">2. 재질과 질감</p>
                      <p className="text-muted-foreground text-xs">
                        "glossy", "matte", "translucent" 등 재질 키워드로
                        디테일을 주십시오.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">3. 감성 키워드</p>
                      <p className="text-muted-foreground text-xs">
                        "dreamy", "cinematic", "moody" 같은 분위기 용어를
                        추가하면 스타일이 명확해집니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">예시 프롬프트</h4>
                  <div className="bg-muted/40 rounded-md p-4 space-y-2 text-xs text-muted-foreground">
                    <p>
                      "Fashion photoshoot of a reflective chrome mannequin
                      replaced by a Korean female model, wearing avant-garde
                      metallic outfit, dramatic rim lighting from HDRI,
                      volumetric fog"
                    </p>
                    <p>
                      "Product render of a crystal perfume bottle on marble
                      pedestal, soft morning sun through sheer curtains, shallow
                      depth of field"
                    </p>
                  </div>
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
          className="min-h-[100px] text-sm"
          disabled={isGenerating}
        />
      </div>

      {/* 네거티브 프롬프트 */}
      <Collapsible
        open={negativePromptOpen}
        onOpenChange={setNegativePromptOpen}
      >
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

      {/* 파라미터 슬라이더 */}
      <TooltipProvider>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">파라미터</h4>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Label>변환 강도</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px]">
                    <p className="text-xs ">
                      원본 이미지를 얼마나 변경할지 결정합니다. 높을수록 더 많이
                      변경됩니다.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-muted-foreground">
                {strength.toFixed(2)}
              </span>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Label>생성 단계</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px]">
                    <p className="text-xs">
                      이미지 생성에 사용되는 단계 수입니다. 높을수록 품질이
                      좋아지지만 시간이 오래 걸립니다.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Label>프롬프트 충실도</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px]">
                    <p className="text-xs">
                      프롬프트를 얼마나 따를지 결정합니다. 높을수록 프롬프트에
                      더 충실하게 생성됩니다.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-muted-foreground">
                {guidanceScale.toFixed(1)}
              </span>
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
      </TooltipProvider>

      {/* 생성 버튼 */}
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
          disabled={!prompt.trim() || !hasApiKey}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          프리비주얼 생성
        </Button>
      )}
    </div>
  );

  // 히스토리 탭 컨텐츠
  const renderHistoryContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">생성 히스토리</h4>
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
        <div className="text-sm text-muted-foreground text-center py-8">
          생성된 프리비주얼이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
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

      {/* 선택된 프리뷰 상세 */}
      {selectedPreview && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="relative aspect-video rounded-md overflow-hidden bg-black">
              <img
                src={selectedPreview.resultImage}
                alt={selectedPreview.prompt}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="line-clamp-2">{selectedPreview.prompt}</p>
            </div>

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
                씬 비교
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(selectedPreview)}
              >
                <Download className="w-4 h-4 mr-1" />
                이미지 다운로드
              </Button>
            </div>

            <div className="flex gap-2">
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
    </div>
  );

  // 설정 탭 컨텐츠
  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">API 키 설정</h4>
        <p className="text-sm text-muted-foreground">
          AI 이미지 생성을 위한 API 키를 입력하세요. Google Ai Studio에서 API를
          발급받은 뒤 아래 입력란에 붙여넣으면 됩니다.
        </p>
        <p className="text-xs">
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            aistudio.google.com에서 API 키 발급 받기
          </a>
        </p>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
        </div>

        {hasApiKey && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            API 키가 등록되어 있습니다
          </div>
        )}

        {usageStats && (
          <div className="text-sm text-muted-foreground">
            이번 달 사용량: {usageStats.thisMonth || 0}회 /{" "}
            {usageStats.limit || "무제한"}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={savingApiKey}
            className="flex-1"
          >
            {savingApiKey ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            저장
          </Button>
          {hasApiKey && (
            <Button variant="destructive" onClick={handleDeleteApiKey}>
              삭제
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const getActiveTabName = () => {
    return navItems.find((item) => item.id === activeTab)?.name || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CenteredDialogContent className="overflow-hidden p-0 md:max-h-[70vh] md:max-w-[800px] lg:max-w-[900px]">
        <DialogTitle className="sr-only">AI 프리비주얼</DialogTitle>
        <DialogDescription className="sr-only">
          AI를 사용하여 조명 씬을 실사 이미지로 변환합니다.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex w-[200px]">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeTab === item.id}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <button>
                            <item.icon />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[calc(70vh-48px)] flex-1 flex-col overflow-hidden">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <span className="text-muted-foreground">AI 프리비주얼</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getActiveTabName()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {activeTab === "generate" && renderGenerateContent()}
              {activeTab === "history" && renderHistoryContent()}
              {activeTab === "settings" && renderSettingsContent()}
            </div>
          </main>
        </SidebarProvider>
      </CenteredDialogContent>

      {/* Before / After 비교 다이얼로그 */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <CenteredDialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before / After 비교</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </CenteredDialogContent>
      </Dialog>
    </Dialog>
  );
}

export default AiPrevisualizationDialog;
