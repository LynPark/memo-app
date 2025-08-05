import { NextResponse } from 'next/server';

// This is a temporary test implementation to isolate the build error.
export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // The function now simply returns a success message without any database logic.
  return NextResponse.json({ message: `Build test successful for ID: ${id}` });
}