
import { Card, CardContent, CardFooter } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  images?: string[];
  tags: string[];
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function PostCard({ post, onLike, onBookmark, onComment, onShare }: PostCardProps) {
  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    onBookmark?.(post.id);
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Use a working placeholder image service
    target.src = `https://placehold.co/400x200/e2e8f0/64748b?text=이미지+로드+실패`;
  };

  return (
    <Card className="w-full animate-fade-in hover:shadow-lg transition-shadow duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.author.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="px-4 py-3">
        {/* Post Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
        
        {/* Post Content */}
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{post.content}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 ${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
            {post.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt="Post image"
                  className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span 
                key={tag}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full hover:bg-secondary/80 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${post.isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes}</span>
            </Button>

            {/* Comment Button */}
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleComment}>
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </Button>

            {/* Share Button */}
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Bookmark Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className={post.isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : ''}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 