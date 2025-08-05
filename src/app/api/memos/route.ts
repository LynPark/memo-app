import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'memos.json');

interface Comment {
  id: number;
  text: string;
  timestamp: string;
}

interface Memo {
  id: number;
  text: string;
  timestamp: string;
  comments: Comment[];
}

async function readMemos(): Promise<Memo[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeMemos(memos: Memo[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(memos, null, 2));
}

export async function GET() {
  const memos = await readMemos();
  return NextResponse.json(memos);
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const memos = await readMemos();
  const newMemo: Memo = {
    id: Date.now(),
    text,
    timestamp: new Date().toLocaleString('ko-KR'),
    comments: [],
  };
  memos.push(newMemo);
  await writeMemos(memos);

  return NextResponse.json(newMemo, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const { memoId, comment } = await req.json();
    if (!memoId || !comment) {
        return NextResponse.json({ error: 'memoId and comment are required' }, { status: 400 });
    }

    const memos = await readMemos();
    const memoIndex = memos.findIndex(m => m.id === memoId);

    if (memoIndex === -1) {
        return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    const newComment = {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toLocaleString('ko-KR'),
    };

    memos[memoIndex].comments.push(newComment);
    await writeMemos(memos);

    return NextResponse.json(memos[memoIndex], { status: 200 });
}
