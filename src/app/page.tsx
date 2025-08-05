"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    const response = await fetch("/api/memos");
    const data = await response.json();
    setMemos(data);
  };

  const handleAddMemo = async () => {
    if (newMemo.trim() !== "") {
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newMemo }),
      });
      if (response.ok) {
        setNewMemo("");
        fetchMemos();
      }
    }
  };

  const handleAddComment = async (memoId: number) => {
    if (newComment[memoId] && newComment[memoId].trim() !== "") {
      const response = await fetch(`/api/memos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memoId, comment: newComment[memoId] }),
      });

      if (response.ok) {
        setNewComment({ ...newComment, [memoId]: "" });
        setReplyingTo(null);
        fetchMemos();
      }
    }
  };

  const handleDeleteMemo = async (memoId: number) => {
    const response = await fetch(`/api/memos/${memoId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchMemos();
    }
  };

  const handleDeleteComment = async (memoId: number, commentId: number) => {
    const response = await fetch(`/api/memos/${memoId}?commentId=${commentId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchMemos();
    }
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