"use client";

import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

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

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleAddMemo = () => {
    if (newMemo.trim() !== "") {
      setMemos([
        ...memos,
        {
          id: Date.now(),
          text: newMemo,
          timestamp: new Date().toLocaleString('ko-KR'),
          comments: [],
        },
      ]);
      setNewMemo("");
    }
  };

  const handleAddComment = (memoId: number) => {
    if (newComment[memoId] && newComment[memoId].trim() !== "") {
      const updatedMemos = memos.map((memo) => {
        if (memo.id === memoId) {
          return {
            ...memo,
            comments: [
              ...memo.comments,
              {
                id: Date.now(),
                text: newComment[memoId],
                timestamp: new Date().toLocaleString('ko-KR'),
              },
            ],
          };
        }
        return memo;
      });
      setMemos(updatedMemos);
      setNewComment({ ...newComment, [memoId]: "" });
      setReplyingTo(null);
    }
  };

  const handleDeleteMemo = (memoId: number) => {
    setMemos(memos.filter((memo) => memo.id !== memoId));
  };

  const handleDeleteComment = (memoId: number, commentId: number) => {
    const updatedMemos = memos.map((memo) => {
      if (memo.id === memoId) {
        return {
          ...memo,
          comments: memo.comments.filter((comment) => comment.id !== commentId),
        };
      }
      return memo;
    });
    setMemos(updatedMemos);
  };

  return (
    <div className="container vh-100 d-flex flex-column">
      <div className="flex-grow-1 overflow-auto p-3">
        {memos.map((memo) => (
          <div key={memo.id} className="mb-3">
            <div className="d-flex justify-content-end align-items-center mb-1">
               <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleDeleteMemo(memo.id)}>삭제</Button>
               <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setReplyingTo(memo.id)}>답장</Button>
              <div className="bg-primary text-white rounded p-2">
                <div>{memo.text}</div>
                <div className="text-end text-xs">{memo.timestamp}</div>
              </div>
            </div>
            {memo.comments.map((comment) => (
              <div key={comment.id} className="d-flex justify-content-start align-items-center mb-1 ms-5">
                <div className="bg-light rounded p-2">
                  <div>{comment.text}</div>
                  <div className="text-end text-xs">{comment.timestamp}</div>
                </div>
                <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteComment(memo.id, comment.id)}>삭제</Button>
              </div>
            ))}
            {replyingTo === memo.id && (
              <InputGroup className="mt-2 ms-5">
                <Form.Control
                  placeholder="코멘트를 입력하세요"
                  value={newComment[memo.id] || ""}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [memo.id]: e.target.value })
                  }
                   onKeyPress={(e) => e.key === "Enter" && handleAddComment(memo.id)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => handleAddComment(memo.id)}
                >
                  입력
                </Button>
              </InputGroup>
            )}
          </div>
        ))}
      </div>
      <InputGroup className="p-3">
        <Form.Control
          placeholder="메시지를 입력하세요"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddMemo()}
        />
        <Button variant="primary" onClick={handleAddMemo}>
          전송
        </Button>
      </InputGroup>
    </div>
  );
}
