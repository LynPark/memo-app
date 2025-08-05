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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    let memos = await readMemos();

    if (commentId) {
        // Delete a comment
        const commentIdNum = Number(commentId);
        const memoIndex = memos.findIndex(m => m.id === id);
        if (memoIndex !== -1) {
            memos[memoIndex].comments = memos[memoIndex].comments.filter(c => c.id !== commentIdNum);
            await writeMemos(memos);
            return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });
        }
    } else {
        // Delete a memo
        memos = memos.filter(m => m.id !== id);
        await writeMemos(memos);
        return NextResponse.json({ message: 'Memo deleted' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
