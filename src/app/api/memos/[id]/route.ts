import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

interface Comment {
    id: number;
    text: string;
    timestamp: string;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (commentId) {
        // Delete a comment
        const commentIdNum = Number(commentId);
        
        const { data: memoData, error: fetchError } = await supabase
            .from('memos')
            .select('comments')
            .eq('id', id)
            .single();

        if (fetchError || !memoData) {
            return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
        }

        const updatedComments = (memoData.comments as Comment[]).filter((c) => c.id !== commentIdNum);

        const { error: updateError } = await supabase
            .from('memos')
            .update({ comments: updatedComments })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });

    } else {
        // Delete a memo
        const { error } = await supabase.from('memos').delete().eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Memo deleted' }, { status: 200 });
    }
}
