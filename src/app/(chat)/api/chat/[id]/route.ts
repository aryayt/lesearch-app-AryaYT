import { type NextRequest, NextResponse } from "next/server"
import { getChatById, updateChat, deleteChat } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const chat = await getChatById(id)
    if (!chat) {
      return new NextResponse(null, { status: 404 })
    }
    return NextResponse.json(chat)
  } catch (error) {
    console.error("Failed to get chat:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const { title } = body

    if (!title) {
      return new NextResponse(null, { status: 400 })
    }

    await updateChat(id, title)
    revalidatePath("/")
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to update chat:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!id) {
      return new NextResponse(null, { status: 400 })
    }

    await deleteChat(id)
    revalidatePath("/")
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete chat:", error)
    return new NextResponse(null, { status: 500 })
  }
}
