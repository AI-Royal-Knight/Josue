"use client"

import { useEffect, useRef } from "react"
import {
  useController,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import ErrorMessage from "@/components/shared/form-error-message"

type Point = { x: number; y: number }

export default function SignaturePadField<TFieldValues extends FieldValues>({
  name,
  height = 160,
}: {
  name: FieldPath<TFieldValues>
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)

  const {
    field,
    fieldState: { error },
  } = useController<TFieldValues>({ name })

  const dataUrl = (field.value as string | undefined) ?? ""

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    field.onChange("")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = Math.max(1, Math.floor(rect.width * ratio))
    canvas.height = Math.max(1, Math.floor(rect.height * ratio))

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"

    if (dataUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = dataUrl
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPoint = (event: PointerEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    isDrawingRef.current = true
    lastPointRef.current = getPoint(event.nativeEvent, canvas)
    canvas.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!isDrawingRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const next = getPoint(event.nativeEvent, canvas)
    const last = lastPointRef.current
    if (!last) {
      lastPointRef.current = next
      return
    }

    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(next.x, next.y)
    ctx.stroke()
    lastPointRef.current = next
  }

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    isDrawingRef.current = false
    lastPointRef.current = null

    try {
      const nextUrl = canvas.toDataURL("image/png")
      field.onChange(nextUrl)
    } catch {
      // ignore
    }

    try {
      canvas.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Sign above using your mouse or touch screen
        </div>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>

      <div className="rounded-none border border-input bg-foreground">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          style={{ height }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      {error?.message && <ErrorMessage message={error.message} />}
    </div>
  )
}
