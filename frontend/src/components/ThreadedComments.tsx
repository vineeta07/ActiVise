import { useState } from "react";
import { MessageCircle, ThumbsUp, Send, CornerDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type ForumComment = {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_name: string;
  author_avatar: string;
  content: string;
  depth: number;
  likes: number;
  created_at: string;
  children?: ForumComment[];
};

type ThreadedCommentsProps = {
  postId: string;
  comments: ForumComment[];
  onCommentAdded: () => void;
};

function CommentNode({ comment, postId, onCommentAdded }: { comment: ForumComment; postId: string; onCommentAdded: () => void }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    
    await supabase.from("forum_comments").insert({
      post_id: postId,
      parent_comment_id: comment.id,
      content: replyText,
      author_name: "You",
      author_avatar: "YO",
      depth: comment.depth + 1
    });

    // Also increment reply count on the post
    await supabase.rpc('increment_post_replies', { target_post_id: postId });

    setReplyText("");
    setIsReplying(false);
    setIsSubmitting(false);
    onCommentAdded();
  };

  const handleUpvote = async () => {
    // Check if already upvoted by this user (simulated user_key)
    const user_key = "demo-user";
    const { data: existing } = await supabase
      .from("forum_upvotes")
      .select("id")
      .eq("comment_id", comment.id)
      .eq("user_key", user_key)
      .maybeSingle();

    if (!existing) {
      // Create upvote
      await supabase.from("forum_upvotes").insert({
        comment_id: comment.id,
        user_key
      });
      // Increment count
      await supabase.from("forum_comments")
        .update({ likes: comment.likes + 1 })
        .eq("id", comment.id);
      
      onCommentAdded();
    } else {
      // Remove upvote
      await supabase.from("forum_upvotes").delete().eq("id", existing.id);
      // Decrement count
      await supabase.from("forum_comments")
        .update({ likes: Math.max(0, comment.likes - 1) })
        .eq("id", comment.id);
      
      onCommentAdded();
    }
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  return (
    <div className={`mt-3 ${comment.depth > 0 ? "ml-4 md:ml-8 relative" : ""}`}>
      {comment.depth > 0 && (
        <div className="absolute -left-3 md:-left-6 top-3 text-border">
          <CornerDownRight className="h-4 w-4" />
        </div>
      )}
      
      <div className={`rounded-lg border border-border/50 bg-secondary/10 p-3 ${comment.depth === 0 ? "bg-card border-border" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-heading text-secondary-foreground">
              {comment.author_avatar}
            </div>
            <p className="text-xs font-medium text-foreground">{comment.author_name}</p>
            <span className="text-[10px] text-muted-foreground">• {timeAgo(comment.created_at)}</span>
          </div>
          {(comment.children && comment.children.length > 0) && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? `[+${comment.children.length}]` : "[-]"}
            </button>
          )}
        </div>
        
        <p className="text-sm text-foreground mb-2">{comment.content}</p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleUpvote}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ThumbsUp className="h-3 w-3" />
            {comment.likes}
          </button>
          
          {comment.depth < 3 && (
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-3 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-background text-sm rounded-md px-3 py-2 border border-border outline-none resize-none h-[40px]"
            />
            <button
              onClick={handleReply}
              disabled={isSubmitting || !replyText.trim()}
              className="h-10 px-3 bg-primary text-primary-foreground rounded-md text-xs font-medium disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && comment.children && comment.children.map(child => (
        <CommentNode key={child.id} comment={child} postId={postId} onCommentAdded={onCommentAdded} />
      ))}
    </div>
  );
}

export default function ThreadedComments({ postId, comments, onCommentAdded }: ThreadedCommentsProps) {
  // Build tree
  const buildTree = (commentsList: ForumComment[]) => {
    const map = new Map<string, ForumComment>();
    const roots: ForumComment[] = [];

    // First pass: initialize map and children arrays
    commentsList.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });

    // Second pass: build tree structure
    commentsList.forEach(c => {
      const node = map.get(c.id)!;
      if (c.parent_comment_id) {
        const parent = map.get(c.parent_comment_id);
        if (parent && parent.children) {
          parent.children.push(node);
        } else {
          // Fallback if parent missing
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(comments);

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {tree.length === 0 ? (
        <p className="text-xs text-muted-foreground italic text-center py-2">No comments yet. Be the first to start the discussion!</p>
      ) : (
        tree.map(comment => (
          <CommentNode key={comment.id} comment={comment} postId={postId} onCommentAdded={onCommentAdded} />
        ))
      )}
    </div>
  );
}
