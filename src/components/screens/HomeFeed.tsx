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
import * as apiroute from "../../Context/API/ApiRouter";

interface HomeFeedProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function HomeFeed({ onNavigate }: HomeFeedProps) {
  const { GETFunction, POSTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const [bigEvents, setBigEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);



  const handleLike = async (postId: string) => {
    try {
      await POSTFunction({}, `${apiroute.posturl}${postId}/like`);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log("Comment on post:", postId);
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      await POSTFunction({ content: commentText }, `${apiroute.posturl}${postId}/comment`);

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: `c${Date.now()}`,
            user: {
              name: "Alex Johnson",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
              username: "alex_j"
            },
            content: commentText,
            timestamp: "Just now"
          };
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), newComment]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
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
      await POSTFunction({}, `${apiroute.eventurl}${eventId}/attend`);

      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isRSVPd: !event.isRSVPd }
          : event
      ));
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const handleBookmark = async (eventId: string) => {
    try {
      await POSTFunction({}, `${apiroute.eventurl}${eventId}/interested`);

      setRecommendedEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      ));
    } catch (error) {
      console.error('Error bookmarking event:', error);
    }
  };

  const handleBigEventClick = (eventId: string) => {
    onNavigate?.("event-detail", { eventId });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch posts and events in parallel
        const [postsResponse, eventsResponse] = await Promise.all([
          GETFunction(apiroute.posturl),
          GETFunction(apiroute.eventurl)
        ]);

        // Transform posts data to match component format
        if (postsResponse && Array.isArray(postsResponse)) {
          const transformedPosts = postsResponse.map((post: any) => ({
            id: post._id,
            user: {
              name: post.author?.firstName && post.author?.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.organization?.name || 'Unknown User',
              avatar: post.author?.profileImage || post.organization?.logo || '',
              username: post.author?.email?.split('@')[0] || post.organization?.name?.toLowerCase().replace(/\s+/g, '') || 'user'
            },
            content: post.content || '',
            image: post.images && post.images.length > 0 ? post.images[0] : undefined,
            timestamp: getTimeAgo(new Date(post.createdAt)),
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            isLiked: false,
            commentsList: post.comments?.map((comment: any) => ({
              id: comment._id || `c${Date.now()}`,
              user: {
                name: comment.user?.firstName && comment.user?.lastName
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : 'Unknown User',
                avatar: comment.user?.profileImage || '',
                username: comment.user?.email?.split('@')[0] || 'user'
              },
              content: comment.content || '',
              timestamp: getTimeAgo(new Date(comment.createdAt))
            })) || []
          }));
          setPosts(transformedPosts);
        }

        // Transform events data to match component format
        if (eventsResponse && Array.isArray(eventsResponse)) {
          const transformedEvents = eventsResponse.slice(0, 2).map((event: any) => ({
            id: event._id,
            title: event.title || '',
            image: event.image || '',
            date: new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: event.eventTime || '',
            location: event.location?.address || 'TBD',
            category: event.category || 'Event',
            attendees: event.attendees?.length || 0,
            price: 'Free',
            isBookmarked: false,
            isRSVPd: false
          }));
          setRecommendedEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";

    return Math.floor(seconds) + "s";
  };

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