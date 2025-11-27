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
  const { GETFunction, POSTFunction, PUTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState([
    {
      id: "1",
      user: {
        name: "Student Government",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        username: "studentgov"
      },
      content: "📢 IMPORTANT: New library hours starting Monday! Extended study hours during finals week. Open 24/7 from Dec 10-22. Good luck with exams everyone! 📚✨",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
      timestamp: "2h",
      likes: 156,
      comments: 23,
      isLiked: false,
      commentsList: [
        {
          id: "c1",
          user: {
            name: "Emily Rodriguez",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
            username: "emily_r"
          },
          content: "This is amazing! Finally can study late 🙏",
          timestamp: "1h ago"
        },
        {
          id: "c2",
          user: {
            name: "David Kim",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
            username: "david_kim"
          },
          content: "Best news all week! Thank you Student Gov! 📚",
          timestamp: "45m ago"
        }
      ]
    },
    {
      id: "2",
      user: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        username: "sarahc_22"
      },
      content: "Just finished my first coding interview! 💻 Feeling nervous but excited. Thanks to everyone who helped me practice. CS students - the career center's mock interviews are amazing! #coding #internship",
      timestamp: "3h",
      likes: 89,
      comments: 31,
      isLiked: true,
      commentsList: [
        {
          id: "c3",
          user: {
            name: "Marcus Johnson",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
            username: "marcus_j"
          },
          content: "You got this Sarah! 🚀",
          timestamp: "2h ago"
        },
        {
          id: "c4",
          user: {
            name: "Jessica Taylor",
            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
            username: "jess_t"
          },
          content: "Good luck! Let us know how it goes!",
          timestamp: "2h ago"
        }
      ]
    },
    {
      id: "3", 
      user: {
        name: "Engineering Society",
        avatar: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&h=150&fit=crop&crop=face",
        username: "engsociety"
      },
      content: "🔧 Tech Talk Series continues this Friday! Join us for 'AI in Sustainable Engineering' with guest speaker Dr. Martinez from Tesla. Free pizza included! 🍕",
      timestamp: "4h",
      likes: 142,
      comments: 28,
      isLiked: false,
      commentsList: [
        {
          id: "c5",
          user: {
            name: "Alex Thompson",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
            username: "alex_t"
          },
          content: "Can't wait for this! Tesla is doing amazing work 🚗⚡",
          timestamp: "3h ago"
        }
      ]
    },
    {
      id: "4",
      user: {
        name: "Marcus Johnson", 
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        username: "marcus_j"
      },
      content: "Shoutout to the amazing turnout at yesterday's climate action rally! 🌍 Over 800 students showed up. Change starts with us! Next meeting: Tuesday 7pm at Student Union Room 205 #climateaction",
      image: "https://images.unsplash.com/photo-1573166364524-d9d8d464b0fe?w=600&h=400&fit=crop",
      timestamp: "6h",
      likes: 234,
      comments: 45,
      isLiked: true,
      commentsList: []
    },
    {
      id: "5",
      user: {
        name: "Campus Recreation",
        avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face", 
        username: "campusrec"
      },
      content: "🏃‍♀️ Intramural Basketball registration is OPEN! Teams of 5, season starts Jan 15th. $50 per team. Register at the Rec Center or online! 🏀",
      timestamp: "8h",
      likes: 67,
      comments: 18,
      isLiked: false,
      commentsList: []
    }
  ]);

  const [bigEvents, setBigEvents] = useState([
    {
      id: "big-1",
      title: "Spring Career Fair 2024",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      date: "Mar 15-16",
      time: "2 Days",
      location: "Student Union",
      category: "Career",
      attendees: 2500,
      price: "Free",
      isBookmarked: false,
      isRSVPd: false,
      status: "upcoming"
    },
    {
      id: "big-2",
      title: "Homecoming Weekend",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      date: "Oct 12-14",
      time: "3 Days",
      location: "Campus-wide",
      category: "Campus",
      attendees: 8000,
      price: "Varies",
      isBookmarked: true,
      isRSVPd: true,
      status: "happening"
    },
    {
      id: "big-3",
      title: "Graduation Ceremony",
      image: "https://images.unsplash.com/photo-1627556704203-3a0712d18d37?w=400&h=300&fit=crop",
      date: "May 18",
      time: "10:00 AM",
      location: "Football Stadium",
      category: "Academic",
      attendees: 15000,
      price: "Free",
      isBookmarked: false,
      isRSVPd: false,
      status: "upcoming"
    }
  ]);

  const [recommendedEvents, setRecommendedEvents] = useState([
    {
      id: "1",
      title: "Study Abroad Info Session",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
      date: "Dec 20",
      time: "3:00 PM",
      location: "International Center",
      category: "Academic",
      attendees: 45,
      price: "Free",
      isBookmarked: false,
      isRSVPd: false
    },
    {
      id: "2",
      title: "Mental Health Workshop",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      date: "Dec 22",
      time: "1:00 PM",
      location: "Wellness Center",
      category: "Wellness",
      attendees: 67,
      price: "Free",
      isBookmarked: true,
      isRSVPd: true
    }
  ]);



  const handleLike = async (postId: string) => {
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

    try {
      // Call backend API to like/unlike post
      // Endpoint: POST /api/post/:id/like or PUT /api/post/:id/like
      const response = await POSTFunction({}, `${apiroute.posturl}${postId}/like`);

      if (!response.success) {
        // Revert optimistic update on failure
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes + 1 : post.likes - 1
              }
            : post
        ));
        console.error("Failed to like post:", response.error);
      }
    } catch (err) {
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
      console.error("Error liking post:", err);
    }
  };

  const handleComment = (postId: string) => {
    console.log("Comment on post:", postId);
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      // Call backend API to add comment
      // Endpoint: POST /api/post/:id/comment
      const response = await POSTFunction(
        { content: commentText },
        `${apiroute.posturl}${postId}/comment`
      );

      if (response.success) {
        // Update posts with the new comment from the server
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const newComment = {
              id: response.comment?._id || `c${Date.now()}`,
              user: {
                name: response.comment?.author?.name || "You",
                avatar: response.comment?.author?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                username: response.comment?.author?.username || "you"
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
      } else {
        console.error("Failed to add comment:", response.error);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
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

  const handleRSVP = (eventId: string) => {
    setRecommendedEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRSVPd: !event.isRSVPd }
        : event
    ));
  };

  const handleBookmark = (eventId: string) => {
    setRecommendedEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isBookmarked: !event.isBookmarked }
        : event
    ));
  };

  const handleBigEventClick = (eventId: string) => {
    onNavigate?.("event-detail", { eventId });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await GETFunction(apiroute.posturl);

      if (response.success) {
        // Transform backend data to match the PostCard interface
        const transformedPosts = response.posts.map((post: any) => ({
          id: post._id || post.id,
          user: {
            name: post.author?.name || post.organizationName || "Unknown User",
            avatar: post.author?.avatar || post.organizationAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            username: post.author?.username || post.organizationUsername || "unknown"
          },
          content: post.content || post.description || "",
          image: post.image || post.imageUrl,
          timestamp: formatTimestamp(post.createdAt || post.date),
          likes: post.likes || 0,
          comments: post.comments?.length || 0,
          isLiked: post.isLiked || false,
          commentsList: post.comments || []
        }));

        setPosts(transformedPosts);
      } else {
        setError(response.error || "Failed to fetch posts");
        console.error("Failed to fetch posts:", response.error);
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.");
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString();
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPosts}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {isLoading ? (
            <>
              <SkeletonPostCard />
              <SkeletonPostCard />
            </>
          ) : posts.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts available. Check back later!</p>
            </div>
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
          {!isLoading && !error && posts.length > 2 && (
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