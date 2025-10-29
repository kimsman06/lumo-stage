import * as React from "react"
import { DialogContent } from "./dialog"
import { cn } from "@/lib/utils"

/**
 * 가운데에서 zoom 효과로 나타나는 Dialog Content
 * 원본 DialogContent에서 slide 애니메이션을 제거한 버전
 */
const CenteredDialogContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <DialogContent
      ref={ref}
      className={cn(
        // 기존 slide 애니메이션 제거
        "[&]:data-[state=closed]:slide-out-to-left-0",
        "[&]:data-[state=closed]:slide-out-to-top-0",
        "[&]:data-[state=open]:slide-in-from-left-0",
        "[&]:data-[state=open]:slide-in-from-top-0",
        className
      )}
      {...props}
    />
  )
})

CenteredDialogContent.displayName = "CenteredDialogContent"

export { CenteredDialogContent }
