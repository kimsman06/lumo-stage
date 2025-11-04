import * as React from "react"
import { AlertDialogContent } from "./alert-dialog"
import { cn } from "@/lib/utils"

/**
 * 가운데에서 zoom 효과로 나타나는 AlertDialog Content
 * 원본 AlertDialogContent에서 slide 애니메이션을 제거한 버전
 */
const CenteredAlertDialogContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <AlertDialogContent
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

CenteredAlertDialogContent.displayName = "CenteredAlertDialogContent"

export { CenteredAlertDialogContent }
