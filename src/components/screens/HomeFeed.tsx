import { useState, useEffect, useContext } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PostCard } from "../common/PostCard";
import { EventCard } from "../common/EventCard";
import { Search, Bell, Star } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { SkeletonPostCard, SkeletonBigEventCard } from "../common/SkeletonCard";
import APIContext from "../../Context/apimethods/APIContext";
import { posturl, eventurl } from "../../Context/API/ApiRouter";

interface HomeFeedProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function HomeFeed({ onNavigate }: HomeFeedProps) {
  const { GETFunction, POSTFunction, PUTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [bigEvents, setBigEvents] = useState<any[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);



  // Fetch posts and events from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch posts
      const postsResponse = await GETFunction(posturl);
      if (postsResponse?.success && postsResponse?.data) {
        setPosts(postsResponse.data);
      }

      // Fetch events
      const eventsResponse = await GETFunction(eventurl);
      if (eventsResponse?.success && eventsResponse?.data) {
        // Filter and categorize events
        const allEvents = eventsResponse.data;
        const bigEventsList = allEvents.filter((e: any) => e.isFeatured || e.attendees > 1000);
        const recommendedEventsList = allEvents.filter((e: any) => !e.isFeatured && e.attendees <= 1000);

        setBigEvents(bigEventsList.slice(0, 3));
        setRecommendedEvents(recommendedEventsList.slice(0, 2));
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load feed data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));

      // Make API call to update like
      await PUTFunction({ postId }, `${posturl}${postId}/like`);
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes + 1 : post.likes - 1
            }
          : post
      ));
    }
  };

  const handleComment = (postId: string) => {
    console.log("Comment on post:", postId);
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      // Optimistically add comment to UI
      const tempComment = {
        id: `temp-${Date.now()}`,
        user: {
          name: "Current User",
          avatar: "",
          username: "current_user"
        },
        content: commentText,
        timestamp: "Just now"
      };

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), tempComment]
          };
        }
        return post;
      }));

      // Make API call to add comment
      const response = await POSTFunction({ content: commentText }, `${posturl}${postId}/comment`);

      // Update with actual comment data from server
      if (response?.success && response?.data) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const updatedComments = post.commentsList.filter((c: any) => c.id !== tempComment.id);
            return {
              ...post,
              commentsList: [...updatedComments, response.data]
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      // Could add error toast here
    }
  };

  const handleShare = (postId: string) => {
    console.log("Share post:", postId);
  };

  const handleUserClick = (username: string, userType: 'student' | 'organization') => {
    // Check if this is the current user or an organization they manage
    const ownProfiles = ['studentgov', 'engsociety', 'campusrec'];  // Organizations the user manages
    
    if (userType === 'organization') {
      // Navigate to organization profile - map username to organizationId
      const orgIdMapping: Record<string, string> = {
        'studentgov': 'org1',        // Computer Science Club / Student Government
        'engsociety': 'org2',        // Engineering Society
        'campusrec': 'org3',         // Campus Recreation
      };
      
      const organizationId = orgIdMapping[username] || 'org1';
      onNavigate?.("organizationProfile", { organizationId });
    } else {
      // Check if clicking on own profile
      if (username === 'alex_j' || username === 'alexjohnson') {
        // Navigate to own profile
        onNavigate?.("profile", { profileId: 'student' });
      } else {
        // Navigate to other user's profile - map username to userId
        const userIdMapping: Record<string, string> = {
          'sarahc_22': '1',  // Sarah Chen
          'emily_r': '2',    // Emily Rodriguez
          'marcus_j': '3',   // Marcus Johnson
          'david_kim': '4',  // David Kim
          'jess_t': '5'      // Jessica Taylor
        };
        
        const userId = userIdMapping[username] || '1';
        onNavigate?.("otherUserProfile", { userId });
      }
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      // Optimistically update UI
      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isRSVPd: !event.isRSVPd }
          : event
      ));

      // Make API call to update RSVP
      await PUTFunction({ eventId }, `${eventurl}${eventId}/rsvp`);
    } catch (err) {
      console.error("Error updating RSVP:", err);
      // Revert optimistic update on error
      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isRSVPd: !event.isRSVPd }
          : event
      ));
    }
  };

  const handleBookmark = async (eventId: string) => {
    try {
      // Optimistically update UI
      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      ));

      // Make API call to update bookmark
      await PUTFunction({ eventId }, `${eventurl}${eventId}/bookmark`);
    } catch (err) {
      console.error("Error updating bookmark:", err);
      // Revert optimistic update on error
      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      ));
    }
  };

  const handleBigEventClick = (eventId: string) => {
    onNavigate?.("event-detail", { eventId });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Campus Feed</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive">
            <p className="font-medium">Error loading feed</p>
            <p className="text-sm mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchData}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md mx-auto">
        {/* Big Events Section */}
        {/* <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Major Campus Events</h2>
            </div>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {bigEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex-shrink-0 w-48 cursor-pointer"
                onClick={() => handleBigEventClick(event.id)}
              >
                <div className="relative rounded-lg overflow-hidden mb-2">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'happening' 
                        ? 'bg-green-500 text-white' 
                        : event.status === 'upcoming'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {event.status === 'happening' ? 'Live' : 
                       event.status === 'upcoming' ? 'Soon' : 'Past'}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                      {event.attendees.toLocaleString()}
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{event.title}</h3>
                <p className="text-xs text-muted-foreground">{event.date} • {event.location}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Campus Feed */}
        <div className="p-4 space-y-6">
          {/* Recent Posts */}
          {isLoading ? (
            <>
              <SkeletonPostCard />
              <SkeletonPostCard />
            </>
          ) : (
            posts.slice(0, 2).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onAddComment={handleAddComment}
                onShare={handleShare}
                onUserClick={handleUserClick}
                onCommentUserClick={handleUserClick}
              />
            ))
          )}

          {/* Recommended Events Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming for you</h2>
              <Button variant="ghost" size="sm">
                See all
              </Button>
            </div>

            <div className="space-y-3">
              {recommendedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="feed"
                  onRSVP={handleRSVP}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          </div>

          {/* More Posts */}
          {isLoading ? (
            <>
              <SkeletonPostCard />
              <SkeletonPostCard />
            </>
          ) : (
            posts.slice(2).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onAddComment={handleAddComment}
                onShare={handleShare}
                onUserClick={handleUserClick}
                onCommentUserClick={handleUserClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}