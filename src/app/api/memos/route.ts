import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  const { data, error } = await supabase.from('memos').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching memos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('memos').insert([{ text, comments: [] }]).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}

export async function PUT(req: NextRequest) {
    const { memoId, comment } = await req.json();
    if (!memoId || !comment) {
        return NextResponse.json({ error: 'memoId and comment are required' }, { status: 400 });
    }

    // First, get the current comments
    const { data: memoData, error: fetchError } = await supabase
        .from('memos')
        .select('comments')
        .eq('id', memoId)
        .single();

    if (fetchError || !memoData) {
        return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    const newComment = {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toLocaleString('ko-KR'),
    };

    const updatedComments = [...memoData.comments, newComment];

    const { data, error } = await supabase
        .from('memos')
        .update({ comments: updatedComments })
        .eq('id', memoId)
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 });
}