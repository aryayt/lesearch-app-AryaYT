import { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = parseInt(searchParams.get('limit') || '20');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return Response.json('Document ID is required!', { status: 400 });
  }

  if (startingAfter && endingBefore) {
    return Response.json(
      'Only one of starting_after or ending_before can be provided!',
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  try {
    const chats = await getChatsByUserId({
      user_id: user.id,
      document_id: documentId,
      limit,
      startingAfter,
      endingBefore,
    });

    return Response.json(chats);
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return Response.json('Failed to fetch chats!', { status: 500 });
  }
}
