import { NextResponse } from 'next/server';
import { getChatById, updateChat, deleteChat } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chat = await getChatById(params.id);
    if (!chat) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Failed to get chat:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return new NextResponse(null, { status: 400 });
    }

    await updateChat(params.id, title);
    revalidatePath('/');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to update chat:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;
    if (!chatId) {
      return new NextResponse(null, { status: 400 });
    }

    await deleteChat(chatId);
    revalidatePath('/');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return new NextResponse(null, { status: 500 });
  }
} 