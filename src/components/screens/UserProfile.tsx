import { useState, useEffect, useContext } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { SkeletonProfileHeader, SkeletonPostCard } from "../common/SkeletonCard";
import APIContext from "../../Context/apimethods/APIContext";
import { userinfo, posturl, eventurl } from "../../Context/API/ApiRouter";
import {
  Settings,
  MapPin,
  Calendar,
  Users,
  Edit3,
  Mail,
  Phone,
  Globe,
  Award,
  GraduationCap,
  Building2,
  Target,
  Link as LinkIcon,
  UserPlus,
  X,
  Plus,
  Check,
  Trash2,
  Send,
  Heart,
  MessageCircle
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

/**
 * Role-Based Permissions System for Organizations:
 * 
 * DEFAULT ROLE ASSIGNMENTS:
 *   - When a user CREATES an organization → Assigned "President" role
 *   - When a user JOINS an organization → Assigned "Member" role
 *   - Admins/Presidents can change roles later via Member Management
 * 
 * President / Vice President:
 *   - Full access to all organization features
 *   - Can update organization bio and information
 *   - Can create, edit, and delete posts and events
 *   - Can approve, remove, and change member roles
 * 
 * Event Manager:
 *   - Can update organization bio and information
 *   - Can create, edit, and delete posts and events
 *   - Cannot manage members (approve, remove, change roles)
 * 
 * Content Editor:
 *   - Can create, edit, and delete posts only
 *   - Cannot edit organization bio
 *   - Cannot manage events or members
 * 
 * Member:
 *   - View-only access to all organization content
 *   - Cannot make any changes to the organization
 */

interface UserProfileProps {
  selectedProfileId?: string;
  activeTab?: string;
  onNavigate?: (screen: string, data?: any) => void;
}

export function UserProfile({ selectedProfileId = "student", activeTab = "about", onNavigate }: UserProfileProps) {
  const { GETFunction, POSTFunction, PUTFunction } = useContext(APIContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bio: "",
    major: "",
    minor: "",
    academicLevel: "",
    graduationYear: "",
    skills: [] as string[],
    interests: [] as string[],
    newSkill: "",
    newInterest: ""
  });

  // Organization edit form data
  const [orgEditFormData, setOrgEditFormData] = useState({
    description: "",
    mission: "",
    category: "",
    email: "",
    phone: "",
    website: "",
    discord: "",
    instagram: "",
    linkedin: ""
  });

  // Profile image upload states
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [imageArray, setImageArray] = useState<any>(null);
  // Create event dialog state
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [createEventFormData, setCreateEventFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    imageUrl: ""
  });

  // Event image upload states
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string>("");

  // Edit event dialog state
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);

  // Edit event image upload states
  const [editEventImageFile, setEditEventImageFile] = useState<File | null>(null);
  const [editEventImagePreview, setEditEventImagePreview] = useState<string>("");

  const [editEventFormData, setEditEventFormData] = useState({
    id: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    imageUrl: ""
  });

  // Member management state
  const [isInviteMemberDialogOpen, setIsInviteMemberDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member"); // Default role when inviting new members

  // Pending member requests (mock data)
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "p1",
      name: "Jordan Chen",
      email: "jordan.chen@university.edu",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
      major: "Computer Engineering",
      requestDate: "2 days ago"
    },
    {
      id: "p2",
      name: "Taylor Smith",
      email: "taylor.smith@university.edu",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      major: "Information Systems",
      requestDate: "5 days ago"
    }
  ]);

  // Posts management state
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false);

  // Create organization state
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [createOrgFormData, setCreateOrgFormData] = useState({
    name: "",
    description: "",
    mission: "",
    category: "",
    email: "",
    phone: "",
    website: "",
    discord: "",
    instagram: "",
    linkedin: ""
  });
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string>("");
  const [createPostFormData, setCreatePostFormData] = useState({
    title: "",
    content: "",
    category: "",
    imageUrl: ""
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedEditImage, setUploadedEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [editPostFormData, setEditPostFormData] = useState({
    id: "",
    title: "",
    content: "",
    category: "",
    imageUrl: ""
  });

  // Mock posts data (would come from database in real app)
  const [organizationPosts, setOrganizationPosts] = useState([
    {
      id: "post1",
      title: "Hackathon 2025 Registration Now Open!",
      content: "We're excited to announce that registration for our annual Hackathon is now open! Join us for 48 hours of coding, collaboration, and innovation. Prizes worth $10,000!",
      category: "Announcement",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
      date: "2 days ago",
      author: "Admin Team",
      likes: 12,
      comments: 3
    },
    {
      id: "post2",
      title: "Weekly Study Session - Algorithm Design",
      content: "Join us this Friday for our weekly algorithm design study session. We'll be covering dynamic programming and graph algorithms. All skill levels welcome!",
      category: "Event",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
      date: "5 days ago",
      author: "Study Group Lead",
      likes: 7,
      comments: 1
    },
    {
      id: "post3",
      title: "New Partnership with Tech Giants",
      content: "We're thrilled to announce new partnerships with leading tech companies! This means more workshops, internship opportunities, and networking events for our members.",
      category: "News",
      imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      date: "1 week ago",
      author: "President",
      likes: 20,
      comments: 5
    }
  ]);

  // Student posts state (personal posts by the student)
  const [studentPosts, setStudentPosts] = useState([
    {
      id: "studentpost1",
      title: "Looking for Project Partners",
      content: "I'm working on a machine learning project about sentiment analysis. Looking for teammates who have experience with Python and NLP. Let's connect!",
      category: "Collaboration",
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
      date: "1 day ago"
    },
    {
      id: "studentpost2",
      title: "Study Group for Data Structures",
      content: "Starting a weekly study group for CS 201 - Data Structures. Meeting every Tuesday at 6 PM in the library. All are welcome!",
      category: "Study",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop",
      date: "3 days ago"
    },
    {
      id: "studentpost3",
      title: "Successful Internship at Google!",
      content: "Just finished my summer internship at Google! Learned so much about cloud architecture and scalable systems. Happy to share my experience and tips!",
      category: "Achievement",
      imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=400&fit=crop",
      date: "1 week ago"
    }
  ]);

  // Fetch user profile data from backend
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await GETFunction(userinfo);
      if (response?.success && response?.data) {
        setUserProfileData(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock student data (fallback if API fails)
  const studentProfile = userProfileData || {
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Computer Science major passionate about AI/ML and full-stack development. Always looking to collaborate on innovative projects!",
    academicLevel: "Junior",
    major: "Computer Science",
    minor: "Mathematics",
    graduationYear: "2026",
    location: "Engineering Building, Room 304",
    joinedDate: "Fall 2023",
    stats: {
      enrolledOrgs: 3,
      eventsAttended: 18,
      followers: 127
    },
    skills: ["Python", "React", "Machine Learning", "Data Structures", "UI/UX Design"],
    interests: ["Artificial Intelligence", "Web Development", "Hackathons", "Open Source"],
    enrolledOrganizations: [
      {
        id: "1",
        name: "Computer Science Society",
        role: "Vice President",
        logo: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=100&h=100&fit=crop",
        category: "Academic",
        socialMedia: {
          discord: "cssociety",
          instagram: "@cs_society",
          linkedin: "cs-society-university"
        }
      },
      {
        id: "2",
        name: "AI Research Club",
        role: "Vice President",
        logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
        category: "Academic",
        socialMedia: {
          discord: "ai_research",
          instagram: "@ai_research_club",
          linkedin: "ai-research-club"
        }
      },
      {
        id: "3",
        name: "HackNight Weekly",
        role: "President",
        logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&h=100&fit=crop",
        category: "Technical",
        socialMedia: {
          discord: "hacknight",
          instagram: "@hacknight_weekly",
          linkedin: "hacknight-weekly"
        }
      }
    ]
  };

  // Mock organization data - ALL organizations in the system
  const allOrganizations: Record<string, any> = {
    "1": {
      id: "1",
      name: "Computer Science Society",
      email: "contact@cssociety.edu",
      avatar: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&h=300&fit=crop",
      banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
      description: "The premier organization for Computer Science students at the university. We host tech talks, hackathons, and networking events to help students grow their skills and connect with industry professionals.",
      mission: "To foster a collaborative community of aspiring technologists through educational events, hands-on projects, and industry connections.",
      category: "Academic",
      location: "Engineering Building, Room 215",
      foundedDate: "2015",
      website: "https://cssociety.university.edu",
      socialMedia: {
        discord: "cssociety",
        instagram: "@cs_society",
        linkedin: "cs-society-university"
      },
      stats: {
        members: 342,
        eventsHosted: 28,
        postsPublished: 45
      },
      contactInfo: {
        president: "Sarah Chen",
        vicePresident: "Alex Johnson",
        email: "contact@cssociety.edu",
        phone: "(555) 123-4567"
      },
      upcomingEvents: [
        {
          id: "1",
          title: "CS Study Group for Finals",
          date: "Dec 18",
          time: "6:00 PM",
          location: "Library Room 204",
          attendees: 23,
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop",
          status: "approved"
        },
        {
          id: "2",
          title: "Tech Innovation Showcase",
          date: "May 20",
          time: "4:00 PM",
          location: "Engineering Building Atrium",
          attendees: 289,
          image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=300&h=200&fit=crop",
          status: "pending"
        }
      ],

      members: [
        {
          id: "1",
          name: "Sarah Chen",
          role: "President",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        },
        {
          id: "2",
          name: "Alex Johnson",
          role: "Vice President",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        },
        {
          id: "3",
          name: "Marcus Williams",
          role: "Event Manager",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
          major: "Software Engineering"
        },
        {
          id: "4",
          name: "Emily Rodriguez",
          role: "Content Editor",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        },
        {
          id: "5",
          name: "Jordan Taylor",
          role: "Member",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          major: "Information Systems"
        }
      ]
    },
    "2": {
      id: "2",
      name: "AI Research Club",
      email: "contact@airesearch.edu",
      avatar: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=300&fit=crop",
      banner: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=400&fit=crop",
      description: "Dedicated to advancing AI research and applications on campus. We organize research paper discussions, ML workshops, and collaborate on cutting-edge AI projects.",
      mission: "To create an inclusive environment where students can explore, learn, and contribute to the field of artificial intelligence.",
      category: "Academic",
      location: "Research Lab, Building C",
      foundedDate: "2018",
      website: "https://airesearch.university.edu",
      socialMedia: {
        discord: "ai_research",
        instagram: "@ai_research_club",
        linkedin: "ai-research-club"
      },
      stats: {
        members: 156,
        eventsHosted: 42,
        postsPublished: 38
      },
      contactInfo: {
        president: "Dr. Maya Patel",
        vicePresident: "Alex Johnson",
        email: "contact@airesearch.edu",
        phone: "(555) 987-6543"
      },
      upcomingEvents: [
        {
          id: "1",
          title: "Deep Learning Workshop",
          date: "Dec 22",
          time: "2:00 PM",
          location: "Research Lab 301",
          attendees: 45,
          image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=300&h=200&fit=crop",
          status: "approved"
        }
      ],
      members: [
        {
          id: "1",
          name: "Dr. Maya Patel",
          role: "President",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
          major: "AI Research Faculty"
        },
        {
          id: "2",
          name: "Alex Johnson",
          role: "Vice President",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        },
        {
          id: "6",
          name: "Sophia Lee",
          role: "Event Manager",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
          major: "Data Science"
        }
      ]
    },
    "3": {
      id: "3",
      name: "HackNight Weekly",
      email: "contact@hacknight.edu",
      avatar: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=300&fit=crop",
      banner: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=400&fit=crop",
      description: "Weekly coding sessions and hackathons for students to build projects, learn new technologies, and collaborate with peers.",
      mission: "To foster a culture of hands-on learning and innovation through regular coding events and project collaboration.",
      category: "Technical",
      location: "Innovation Hub, Room 101",
      foundedDate: "2020",
      website: "https://hacknight.university.edu",
      socialMedia: {
        discord: "hacknight",
        instagram: "@hacknight_weekly",
        linkedin: "hacknight-weekly"
      },
      stats: {
        members: 89,
        eventsHosted: 52,
        postsPublished: 27
      },
      contactInfo: {
        president: "Alex Johnson",
        vicePresident: "Jamie Park",
        email: "contact@hacknight.edu",
        phone: "(555) 456-7890"
      },
      upcomingEvents: [
        {
          id: "1",
          title: "Build-a-thon Weekend",
          date: "Dec 28",
          time: "5:00 PM",
          location: "Innovation Hub",
          attendees: 67,
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop",
          status: "approved"
        }
      ],
      members: [
        {
          id: "2",
          name: "Alex Johnson",
          role: "President",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        },
        {
          id: "7",
          name: "Jamie Park",
          role: "Vice President",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
          major: "Software Engineering"
        },
        {
          id: "8",
          name: "David Kim",
          role: "Content Editor",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
          major: "Computer Science"
        }
      ]
    }
  };

  // Determine profile type based on selectedProfileId
  const profileType = selectedProfileId === "student" ? "student" : "organization";

  // Get the correct organization profile based on selectedProfileId
  const organizationProfile = profileType === "organization"
    ? allOrganizations[selectedProfileId] || allOrganizations["1"]
    : allOrganizations["1"]; // Default fallback

  // Get current profile data based on type
  const currentProfile = profileType === "student" ? studentProfile : organizationProfile;

  // Get current user's role in the organization (for permission checking)
  // In this case, Alex Johnson is Vice President (id: "2")
  const currentUserId = "2"; // This would come from auth context in real app
  const currentUserRole = profileType === "organization"
    ? organizationProfile.members.find((m: any) => m.id === currentUserId)?.role || "Member"
    : "Member";

  // Role-based permission helper functions (only applicable for organization profiles)
  const canEditBio = () => {
    if (profileType !== "organization") return false;
    return ["President", "Vice President", "Event Manager"].includes(currentUserRole);
  };

  const canManageEvents = () => {
    if (profileType !== "organization") return false;
    return ["President", "Vice President", "Event Manager"].includes(currentUserRole);
  };

  const canManagePosts = () => {
    if (profileType !== "organization") return false;
    return ["President", "Vice President", "Event Manager", "Content Editor"].includes(currentUserRole);
  };

  const canManageMembers = () => {
    if (profileType !== "organization") return false;
    return ["President", "Vice President"].includes(currentUserRole);
  };

  // Fetch user profile on mount or when profileId changes
  useEffect(() => {
    fetchUserProfile();
  }, [selectedProfileId]);

  // Profile image upload handlers
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
      };
      setImageArray(file);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
  };

  // Open edit dialog and populate form with current data
  const handleEditProfile = () => {
    if (profileType === "student") {
      setEditFormData({
        bio: studentProfile.bio,
        major: studentProfile.major,
        minor: studentProfile.minor,
        academicLevel: studentProfile.academicLevel,
        graduationYear: studentProfile.graduationYear,
        skills: [...studentProfile.skills],
        interests: [...studentProfile.interests],
        newSkill: "",
        newInterest: ""
      });
      // Set current profile image preview
      setProfileImagePreview(studentProfile.avatar);
    } else {
      setOrgEditFormData({
        description: organizationProfile.description,
        mission: organizationProfile.mission,
        category: organizationProfile.category,
        email: organizationProfile.contactInfo.email,
        phone: organizationProfile.contactInfo.phone,
        website: organizationProfile.website,
        discord: organizationProfile.socialMedia.discord,
        instagram: organizationProfile.socialMedia.instagram,
        linkedin: organizationProfile.socialMedia.linkedin
      });
      // Set current profile image preview
      setProfileImagePreview(organizationProfile.avatar);
    }
    setIsEditDialogOpen(true);
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add new skill
  const handleAddSkill = () => {
    if (editFormData.newSkill.trim() && !editFormData.skills.includes(editFormData.newSkill.trim())) {
      setEditFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ""
      }));
    }
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    setEditFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Add new interest
  const handleAddInterest = () => {
    if (editFormData.newInterest.trim() && !editFormData.interests.includes(editFormData.newInterest.trim())) {
      setEditFormData(prev => ({
        ...prev,
        interests: [...prev.interests, prev.newInterest.trim()],
        newInterest: ""
      }));
    }
  };

  // Remove interest
  const handleRemoveInterest = (interest: string) => {
    setEditFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  // Save profile changes
  const handleSaveProfile = () => {
    if (profileType === "student") {
      const { bio, major, minor, academicLevel, graduationYear, skills, interests } = editFormData;

      console.log("Profile image file to upload:", profileImageFile);
      console.log("bio updated:", bio);
      console.log("major updated:", major);
      console.log("minor updated:", minor);
      console.log("academicLevel updated:", academicLevel);
      console.log("graduationYear updated:", graduationYear);
      console.log("skills updated:", skills);
      console.log("interests updated:", interests);

      // In a real app, this would update the database
      console.log("Saving student profile:", editFormData);



      const formData = new FormData();
      formData.append('image', imageArray);
      formData.append('BIO', bio);
      formData.append('Major', major);
      formData.append('Minor', minor);
      formData.append('AcademicLevel', academicLevel);
      formData.append('GraduationYear', graduationYear);
      formData.append('Skills', JSON.stringify(skills));
      formData.append('Interests', JSON.stringify(interests));





      // Update local data (in real app, this would be from API response)
      studentProfile.bio = bio;
      studentProfile.major = major;
      studentProfile.minor = minor;
      studentProfile.academicLevel = academicLevel;
      studentProfile.graduationYear = graduationYear;
      studentProfile.skills = skills;
      studentProfile.interests = interests;



      // Update profile image if a new one was uploaded
      if (profileImagePreview && profileImagePreview !== studentProfile.avatar) {
        studentProfile.avatar = profileImagePreview;
      }
    } else {

      const { description, mission, category, email, phone, website, discord, instagram, linkedin } = orgEditFormData;
      console.log("Profile image file to upload:");
      
      
      const formdata = new FormData();
      formdata.append('image', imageArray);
      formdata.append('Description', description);
      formdata.append('Mission', mission);
      formdata.append('Category', category);
      formdata.append('Email', email);
      formdata.append('Phone', phone);
      formdata.append('Website', website);
      formdata.append('Discord', discord);
      formdata.append('Instagram', instagram);
      formdata.append('LinkedIn', linkedin);
      
      const formValues = Object.fromEntries(formdata.entries());
      console.table(formValues);

      // Save organization profile
      console.log("Saving organization profile:", orgEditFormData);

      // Update local data
      organizationProfile.description = orgEditFormData.description;
      organizationProfile.mission = orgEditFormData.mission;
      organizationProfile.category = orgEditFormData.category;
      organizationProfile.contactInfo.email = orgEditFormData.email;
      organizationProfile.contactInfo.phone = orgEditFormData.phone;
      organizationProfile.website = orgEditFormData.website;
      organizationProfile.socialMedia.discord = orgEditFormData.discord;
      organizationProfile.socialMedia.instagram = orgEditFormData.instagram;
      organizationProfile.socialMedia.linkedin = orgEditFormData.linkedin;

      // Update profile image if a new one was uploaded
      if (profileImagePreview && profileImagePreview !== organizationProfile.avatar) {
        organizationProfile.avatar = profileImagePreview;
      }
    }

    // Reset profile image upload states
    setProfileImageFile(null);
    setProfileImagePreview("");
    setIsEditDialogOpen(false);
  };

  // Event image upload handlers
  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEventImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEventImage = () => {
    setEventImageFile(null);
    setEventImagePreview("");
  };

  // Edit event image upload handlers
  const handleEditEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditEventImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditEventImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditEventImage = () => {
    setEditEventImageFile(null);
    setEditEventImagePreview("");
  };

  // Handle create event
  const handleCreateEvent = () => {

    let { title, description, date, time, location, category, capacity } = createEventFormData;


    const formdata = new FormData();
    formdata.append('Title', title);
    formdata.append('Description', description);
    formdata.append('Date', date);
    formdata.append('Time', time);
    formdata.append('Location', location);
    formdata.append('Category', category);
    formdata.append('Capacity', capacity.toString());
    formdata.append('Image', eventImageFile || new Blob());

    const formValues = Object.fromEntries(formdata.entries());
    console.table(formValues);

    // In a real app, this would send data to the database
    const eventData = {
      ...createEventFormData,
      imageUrl: eventImagePreview || createEventFormData.imageUrl,
      status: "pending" // New events need approval
    };
    console.log("Creating event:", eventData);

    // Reset form and close dialog
    setCreateEventFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      capacity: "",
      imageUrl: ""
    });
    setEventImageFile(null);
    setEventImagePreview("");
    setIsCreateEventDialogOpen(false);

    // Show success message (in real app, would handle success/error from API)
    alert("Event created successfully! Your event is pending approval and will be visible once approved by an administrator.");
  };

  // Handle open edit event dialog
  const handleOpenEditEvent = (event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    location: string;
    category?: string;
    capacity?: number | string;
    image?: string;
    [key: string]: any;
  }) => {
    // Pre-populate the form with the event's current data
    setEditEventFormData({
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category || "",
      capacity: event.capacity?.toString() || "",
      imageUrl: event.image || ""
    });

    // Set existing image as preview if available
    if (event.image) {
      setEditEventImagePreview(event.image);
    } else {
      setEditEventImagePreview("");
    }
    setEditEventImageFile(null);

    setIsEditEventDialogOpen(true);
  };

  // Handle save edited event
  const handleSaveEditedEvent = () => {

    let { title, description, date, time, location, category, capacity } = editEventFormData;
    const formdata = new FormData();

    formdata.append('Title', title);
    formdata.append('Description', description);
    formdata.append('Date', date);
    formdata.append('Time', time);
    formdata.append('Location', location);
    formdata.append('Category', category);
    formdata.append('Capacity', capacity.toString());
    formdata.append('Image', editEventImageFile || new Blob());
    
    const formValues = Object.fromEntries(formdata.entries());
    console.table(formValues);

    // In a real app, this would send updated data to the database
    const updatedEventData = {
      ...editEventFormData,
      imageUrl: editEventImagePreview || editEventFormData.imageUrl
    };
    console.log("Updating event:", updatedEventData);

    // Update the event in the local data (in real app, this would be from API response)
    const eventIndex = organizationProfile.upcomingEvents.findIndex(e => e.id === editEventFormData.id);
    if (eventIndex !== -1) {
      organizationProfile.upcomingEvents[eventIndex] = {
        ...organizationProfile.upcomingEvents[eventIndex],
        title: editEventFormData.title,
        description: editEventFormData.description,
        date: editEventFormData.date,
        time: editEventFormData.time,
        location: editEventFormData.location,
        category: editEventFormData.category,
        capacity: editEventFormData.capacity,
        image: editEventImagePreview || editEventFormData.imageUrl
      };
    }

    // Reset image states and close dialog
    setEditEventImageFile(null);
    setEditEventImagePreview("");
    setIsEditEventDialogOpen(false);

    // Show success message (in real app, would handle success/error from API)
    alert("Event updated successfully!");
  };

  // Member management handlers
  const handleSendInvite = () => {
    // In a real app, this would send an email invitation
    console.log("Sending invite to:", inviteEmail, "with role:", inviteRole);

    // Reset form and close dialog
    setInviteEmail("");
    setInviteRole("Member");
    setIsInviteMemberDialogOpen(false);

    alert(`Invitation sent to ${inviteEmail}!`);
  };

  const handleApproveRequest = (requestId: string) => {
    // In a real app, this would approve the request in the database
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      console.log("Approving request from:", request.name);

      // By default, when a user joins an organization, assign them the "Member" role
      const newMember = {
        ...request,
        role: "Member" // Default role for new members
      };

      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      alert(`${request.name} has been approved and added to the organization with "Member" role!`);

      // In a real app, you would add the newMember to the organization's members array
      // organizationProfile.members.push(newMember);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    // In a real app, this would reject the request in the database
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      console.log("Rejecting request from:", request.name);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      alert(`${request.name}'s request has been rejected.`);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    // In a real app, this would remove the member from the database
    if (confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      console.log("Removing member:", memberId);
      alert(`${memberName} has been removed from the organization.`);
    }
  };

  const handleUpdateMemberRole = (memberId: string, memberName: string, newRole: string) => {
    // In a real app, this would update the member's role in the database
    console.log("Updating role for member:", memberId, "to:", newRole);
    alert(`${memberName}'s role has been updated to ${newRole}.`);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setCreatePostFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview("");
    setCreatePostFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  // Edit image upload handler
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedEditImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditImagePreview(result);
        setEditPostFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditImage = () => {
    setUploadedEditImage(null);
    setEditImagePreview("");
    setEditPostFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  // Post management handlers
  const handleCreatePost = () => {
    console.log("Creating post with data:");
    console.table(createPostFormData);

    let { title, content, category } = createPostFormData;

    const formData: any = new FormData();
    formData.append('Image', uploadedImage!);
    formData.append('Title', title);
    formData.append('Content', content);
    formData.append('Category', category);
    const formValues = Object.fromEntries(formData.entries());
    console.table(formValues);

    // In a real app, this would send the post data to the database
    const newPost = {
      id: `post${Date.now()}`,
      ...createPostFormData,
      date: "Just now",
      author: "Admin Team"
    };

    setOrganizationPosts([newPost, ...organizationPosts]);

    // Reset form and close dialog
    setCreatePostFormData({
      title: "",
      content: "",
      category: "",
      imageUrl: ""
    });
    setUploadedImage(null);
    setImagePreview("");
    setIsCreatePostDialogOpen(false);

    alert("Post created successfully!");
  };

  const handleEditPost = (post: {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
  }) => {
    // Open edit dialog with pre-filled data
    setEditPostFormData({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl || ""
    });
    // Set existing image preview if available
    if (post.imageUrl) {
      setEditImagePreview(post.imageUrl);
    }
    setIsEditPostDialogOpen(true);
  };

  const handleSaveEditedPost = () => {

    let { title, content, category } = editPostFormData;
    console.log("Form data to be sent:");
    const formData: any = new FormData();
    formData.append('Image', uploadedEditImage!);
    formData.append('Title', title);
    formData.append('Content', content);
    formData.append('Category', category);
    const formValues = Object.fromEntries(formData.entries());
    console.table(formValues);


    // In a real app, this would update the post in the database
    setOrganizationPosts(organizationPosts.map(post =>
      post.id === editPostFormData.id
        ? {
          ...post,
          title: editPostFormData.title,
          content: editPostFormData.content,
          category: editPostFormData.category,
          imageUrl: editPostFormData.imageUrl
        }
        : post
    ));

    // Reset edit image states and close dialog
    setUploadedEditImage(null);
    setEditImagePreview("");
    setIsEditPostDialogOpen(false);

    alert("Post updated successfully!");
  };

  const handleDeletePost = (postId: string, postTitle: string) => {
    // In a real app, this would delete the post from the database
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      setOrganizationPosts(organizationPosts.filter(post => post.id !== postId));
      alert("Post deleted successfully!");
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // In a real app, this would update the follow status in the database
    if (!isFollowing) {
      // Update follower count
      if (profileType === "student") {
        studentProfile.stats.followers += 1;
      }
    } else {
      // Decrease follower count
      if (profileType === "student") {
        studentProfile.stats.followers = Math.max(0, studentProfile.stats.followers - 1);
      }
    }
  };

  // Student post management handlers
  const handleCreateStudentPost = () => {
    let { title, content, category } = createPostFormData;



    const formData: any = new FormData();
    console.log(formData.get('Title'));
    console.log(formData.get('Content'));
    console.log(formData.get('Category'));
    const formValues = Object.fromEntries(formData.entries());

    console.table(formValues);




    // In a real app, this would send the post data to the database
    const newPost = {
      id: `studentpost${Date.now()}`,
      ...createPostFormData,
      date: "Just now"
    };

    setStudentPosts([newPost, ...studentPosts]);

    // Reset form and close dialog
    setCreatePostFormData({
      title: "",
      content: "",
      category: "",
      imageUrl: ""
    });
    setUploadedImage(null);
    setImagePreview("");
    setIsCreatePostDialogOpen(false);

    alert("Post created successfully!");
  };

  const handleEditStudentPost = (post: {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
  }) => {
    // Open edit dialog with pre-filled data
    setEditPostFormData({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl || ""
    });
    // Set existing image preview if available
    if (post.imageUrl) {
      setEditImagePreview(post.imageUrl);
    }
    setIsEditPostDialogOpen(true);
  };

  const handleSaveEditedStudentPost = () => {

    let { title, content, category } = editPostFormData;


    console.log("Form data to be sent:");
    const formData: any = new FormData();
    formData.append('Image', uploadedEditImage!);
    formData.append('Title', title);
    formData.append('Content', content);
    formData.append('Category', category);

    const formValues = Object.fromEntries(formData.entries());

    console.table(formValues);


    // In a real app, this would update the post in the database
    setStudentPosts(studentPosts.map(post =>
      post.id === editPostFormData.id
        ? {
          ...post,
          title: editPostFormData.title,
          content: editPostFormData.content,
          category: editPostFormData.category,
          imageUrl: editPostFormData.imageUrl
        }
        : post
    ));

    // Reset edit image states and close dialog
    setUploadedEditImage(null);
    setEditImagePreview("");
    setIsEditPostDialogOpen(false);

    alert("Post updated successfully!");
  };

  const handleDeleteStudentPost = (postId: string, postTitle: string) => {
    // In a real app, this would delete the post from the database
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      setStudentPosts(studentPosts.filter(post => post.id !== postId));
      alert("Post deleted successfully!");
    }
  };

  // Organization creation handlers
  const handleOrgLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOrgLogoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setOrgLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveOrgLogo = () => {
    setOrgLogoFile(null);
    setOrgLogoPreview("");
  };

  const handleCreateOrganization = () => {

    let { name, description, mission, category, email, phone, website, discord, instagram, linkedin } = createOrgFormData;

    // console.log("Creating organization with data:");
    // console.log(orgLogoFile);
    // console.log(name);
    // console.log(description);
    // console.log(mission);
    // console.log(category);
    // console.log(email);
    // console.log(phone);
    // console.log(website);
    // console.log(discord);
    // console.log(instagram);
    // console.log(linkedin);

    const formData = new FormData();
    formData.append('logo', orgLogoFile!);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('mission', mission);
    formData.append('category', category);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('website', website);
    formData.append('discord', discord);
    formData.append('instagram', instagram);
    formData.append('linkedin', linkedin);

    const formValues = Object.fromEntries(formData.entries());
    console.table(formValues);
    



    // Validate required fields
    if (!createOrgFormData.name || !createOrgFormData.category || !createOrgFormData.description) {
      alert("Please fill in all required fields (Name, Category, Description)");
      return;
    }

    // In a real app, this would create the organization in the database
    const newOrg = {
      id: `org${Date.now()}`,
      name: createOrgFormData.name,
      logo: orgLogoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(createOrgFormData.name)}&background=random`,
      category: createOrgFormData.category,
      role: "President", // By default, when a user creates an organization, assign them the "President" role
      socialMedia: {
        discord: createOrgFormData.discord || "N/A",
        instagram: createOrgFormData.instagram || "N/A",
        linkedin: createOrgFormData.linkedin || "N/A"
      }
    };

    // Add to student's enrolled organizations
    studentProfile.enrolledOrganizations.push(newOrg);

    // Reset form and close dialog
    setCreateOrgFormData({
      name: "",
      description: "",
      mission: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      discord: "",
      instagram: "",
      linkedin: ""
    });
    setOrgLogoFile(null);
    setOrgLogoPreview("");
    setIsCreateOrgDialogOpen(false);

    alert("Organization created successfully! You are now the President.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <SkeletonProfileHeader />
          <div className="mt-6 space-y-4">
            <SkeletonPostCard />
            <SkeletonPostCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 text-destructive">
            <p className="font-medium text-lg">Error loading profile</p>
            <p className="text-sm mt-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchUserProfile}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Header Section */}
      <div className="relative">
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            {/* Avatar */}
            <div className="rounded-full">
              <Avatar className="h-32 w-32 md:h-40 md:w-40">
                <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
                <AvatarFallback className="text-3xl">
                  {currentProfile.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-semibold truncate">{currentProfile.name}</h1>
                    {profileType === "organization" && (
                      <>
                        <Badge variant="secondary" className="text-sm">
                          {organizationProfile.category}
                        </Badge>
                        <Badge variant="outline" className="text-sm bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                          {currentUserRole}
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    {profileType === "student" ? (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm">{studentProfile.academicLevel} • {studentProfile.major}</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">Organization</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isOwnProfile ? (
                    <>
                      {(profileType === "student" || canEditBio()) && (
                        <Button variant="outline" size="sm" onClick={handleEditProfile}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                  {/* <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button> */}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                {profileType === "student" ? (
                  <>
                    <div>
                      <div className="font-semibold">{studentProfile.stats.enrolledOrgs}</div>
                      <div className="text-sm text-muted-foreground">Organizations</div>
                    </div>
                    <div>
                      <div className="font-semibold">{studentProfile.stats.eventsAttended}</div>
                      <div className="text-sm text-muted-foreground">Events Attended</div>
                    </div>
                    <div>
                      <div className="font-semibold">{studentProfile.stats.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-semibold">{organizationProfile.stats.members}</div>
                      <div className="text-sm text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="font-semibold">{organizationProfile.stats.eventsHosted}</div>
                      <div className="text-sm text-muted-foreground">Events Hosted</div>
                    </div>
                    <div>
                      <div className="font-semibold">{organizationProfile.stats.postsPublished}</div>
                      <div className="text-sm text-muted-foreground">Posts Published</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {profileType === "student" ? (
          /* STUDENT PROFILE VIEW */
          <Tabs defaultValue={activeTab} className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{studentProfile.bio}</p>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Major</div>
                      <div className="font-medium">{studentProfile.major}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Minor</div>
                      <div className="font-medium">{studentProfile.minor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Academic Level</div>
                      <div className="font-medium">{studentProfile.academicLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Graduation Year</div>
                      <div className="font-medium">{studentProfile.graduationYear}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Posts Tab (Student) */}
            <TabsContent value="posts" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Posts ({studentPosts.length})</h2>
                <Button size="sm" onClick={() => setIsCreatePostDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {post.imageUrl && (
                        <ImageWithFallback
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                            </div>
                            <h3 className="font-semibold mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {post.content}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStudentPost(post)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteStudentPost(post.id, post.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {studentPosts.length === 0 && (
                  <Card className="md:col-span-2">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No posts yet. Create your first post to share with the community!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Organizations Tab */}
            <TabsContent value="organizations" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Organizations</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsCreateOrgDialogOpen(true)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                  <Button size="sm" onClick={() => onNavigate?.("discover")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join New
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentProfile.enrolledOrganizations.map((org) => (
                  <Card key={org.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={org.logo} alt={org.name} />
                          <AvatarFallback>{org.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{org.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {org.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {org.role}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onNavigate?.("profile", { profileId: org.id, activeTab: "about" })}>
                            View Profile
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Social Media Section */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Social Media</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <LinkIcon className="h-3 w-3" />
                            Discord: {org.socialMedia.discord}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <LinkIcon className="h-3 w-3" />
                            Instagram: {org.socialMedia.instagram}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <LinkIcon className="h-3 w-3" />
                            LinkedIn: {org.socialMedia.linkedin}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* ORGANIZATION PROFILE VIEW */
          <Tabs defaultValue={activeTab} className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Description & Mission */}
              <Card>
                <CardHeader>
                  <CardTitle>About Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{organizationProfile.description}</p>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Our Mission
                    </h3>
                    <p className="text-muted-foreground">{organizationProfile.mission}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium truncate">{organizationProfile.contactInfo.email}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{organizationProfile.contactInfo.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium">{organizationProfile.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-muted-foreground">Website</div>
                        <a href={organizationProfile.website} className="font-medium text-primary hover:underline truncate block">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Leadership</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-muted-foreground">President</div>
                        <div className="font-medium">{organizationProfile.contactInfo.president}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Vice President</div>
                        <div className="font-medium">{organizationProfile.contactInfo.vicePresident}</div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Social Media</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Discord: {organizationProfile.socialMedia.discord}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Instagram: {organizationProfile.socialMedia.instagram}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        LinkedIn: {organizationProfile.socialMedia.linkedin}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role Permissions Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* President / Vice President */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-600 hover:bg-purple-700">President / Vice President</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Full access to all features</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Update organization bio</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Create, edit, and delete posts & events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Approve, remove, and change member roles</span>
                        </li>
                      </ul>
                    </div>

                    {/* Event Manager */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Event Manager</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Update organization bio</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Create, edit, and delete posts & events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Cannot manage members</span>
                        </li>
                      </ul>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Content Editor</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Create, edit, and delete posts only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Cannot edit organization bio</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Cannot manage events or members</span>
                        </li>
                      </ul>
                    </div>

                    {/* Member */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Member</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                          <span>View organization information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Cannot make any changes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                          <span>View-only access to all content</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Events</h2>
                {canManageEvents() && (
                  <Button size="sm" onClick={() => setIsCreateEventDialogOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizationProfile.upcomingEvents.map((event: {
                  id: string;
                  title: string;
                  date: string;
                  time: string;
                  location: string;
                  attendees: number;
                  image: string;
                  status: string;
                  [key: string]: any;
                }) => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold line-clamp-2">{event.title}</h3>
                              {event.status === "pending" && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800 flex-shrink-0">
                                  Pending
                                </Badge>
                              )}
                              {event.status === "approved" && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-500 dark:border-green-800 flex-shrink-0">
                                  Approved
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} interested</span>
                            </div>
                          </div>
                          {canManageEvents() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditEvent(event)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Posts ({organizationPosts.length})</h2>
                {canManagePosts() && (
                  <Button size="sm" onClick={() => setIsCreatePostDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizationPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {post.imageUrl && (
                        <ImageWithFallback
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                            </div>
                            <h3 className="font-semibold mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {post.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              By {post.author}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Heart className="h-4 w-4" />
                                <span className="text-sm">{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-sm">{post.comments || 0}</span>
                              </div>
                            </div>
                          </div>
                          {canManagePosts() && (
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeletePost(post.id, post.title)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {organizationPosts.length === 0 && (
                  <Card className="md:col-span-2">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No posts yet. Create your first post to get started!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              {/* Pending Requests Section */}
              {canManageMembers() && pendingRequests.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Pending Requests ({pendingRequests.length})</h2>
                  </div>

                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.avatar} alt={request.name} />
                              <AvatarFallback>{request.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{request.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{request.major}</p>
                              <p className="text-xs text-muted-foreground mt-1">Requested {request.requestDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Members Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Members ({organizationProfile.stats.members})</h2>
                  {canManageMembers() && (
                    <Button size="sm" onClick={() => setIsInviteMemberDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {organizationProfile.members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{member.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{member.major}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Role Display/Selector - Only editable for Presidents/VPs */}
                            {canManageMembers() ? (
                              <Select
                                value={member.role}
                                onValueChange={(newRole) => handleUpdateMemberRole(member.id, member.name, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="President">President</SelectItem>
                                  <SelectItem value="Vice President">Vice President</SelectItem>
                                  <SelectItem value="Event Manager">Event Manager</SelectItem>
                                  <SelectItem value="Content Editor">Content Editor</SelectItem>
                                  <SelectItem value="Member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="secondary" className="w-32 justify-center">
                                {member.role}
                              </Badge>
                            )}

                            {/* Remove Member Button - Only for Presidents/VPs */}
                            {canManageMembers() && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveMember(member.id, member.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {profileType === "student" ? "Profile" : "Organization"}</DialogTitle>
            <DialogDescription>
              {profileType === "student"
                ? "Update your profile information, skills, and interests."
                : "Update your organization's information and contact details."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {profileType === "student" ? (
              // Student Edit Form
              <>
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileImagePreview || studentProfile.avatar} alt={studentProfile.name} />
                      <AvatarFallback>{studentProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      {!profileImageFile ? (
                        <div>
                          <Input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload a new profile picture (JPG, PNG, or GIF)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {profileImageFile.name} ({(profileImageFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveProfileImage}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove & Choose Another
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={editFormData.bio}
                    onChange={(e) => handleFormChange("bio", e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Select
                        value={editFormData.major}
                        onValueChange={(value) => handleFormChange("major", value)}
                      >
                        <SelectTrigger id="major">
                          <SelectValue placeholder="Select major" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Information Systems">Information Systems</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Business Administration">Business Administration</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Fine Arts">Fine Arts</SelectItem>
                          <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Political Science">Political Science</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minor">Minor</Label>
                      <Select
                        value={editFormData.minor}
                        onValueChange={(value) => handleFormChange("minor", value)}
                      >
                        <SelectTrigger id="minor">
                          <SelectValue placeholder="Select minor (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Information Systems">Information Systems</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Business Administration">Business Administration</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Fine Arts">Fine Arts</SelectItem>
                          <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Political Science">Political Science</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicLevel">Academic Level</Label>
                      <Select
                        value={editFormData.academicLevel}
                        onValueChange={(value) => handleFormChange("academicLevel", value)}
                      >
                        <SelectTrigger id="academicLevel">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Select
                        value={editFormData.graduationYear}
                        onValueChange={(value) => handleFormChange("graduationYear", value)}
                      >
                        <SelectTrigger id="graduationYear">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                          <SelectItem value="2028">2028</SelectItem>
                          <SelectItem value="2029">2029</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Skills */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skills
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., Python, React)"
                      value={editFormData.newSkill}
                      onChange={(e) => handleFormChange("newSkill", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editFormData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Interests */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interests
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest (e.g., AI, Web Development)"
                      value={editFormData.newInterest}
                      onChange={(e) => handleFormChange("newInterest", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={handleAddInterest}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editFormData.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="pl-3 pr-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Organization Edit Form
              <>
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label>Organization Logo</Label>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileImagePreview || organizationProfile.avatar} alt={organizationProfile.name} />
                      <AvatarFallback>{organizationProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      {!profileImageFile ? (
                        <div>
                          <Input
                            id="org-profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload a new organization logo (JPG, PNG, or GIF)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {profileImageFile.name} ({(profileImageFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveProfileImage}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove & Choose Another
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* About Us Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    About Us
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your organization..."
                      value={orgEditFormData.description}
                      onChange={(e) => setOrgEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      placeholder="Your organization's mission..."
                      value={orgEditFormData.mission}
                      onChange={(e) => setOrgEditFormData(prev => ({ ...prev, mission: e.target.value }))}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={orgEditFormData.category}
                      onValueChange={(value) => setOrgEditFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@organization.edu"
                        value={orgEditFormData.email}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={orgEditFormData.phone}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://organization.university.edu"
                        value={orgEditFormData.website}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Social Media
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discord">Discord</Label>
                      <Input
                        id="discord"
                        placeholder="organization_server"
                        value={orgEditFormData.discord}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, discord: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="@organization"
                        value={orgEditFormData.instagram}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        placeholder="organization-university"
                        value={orgEditFormData.linkedin}
                        onChange={(e) => setOrgEditFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new event for your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Event Image */}
            <div className="space-y-2">
              <Label>Event Image</Label>
              {!eventImageFile && !eventImagePreview ? (
                <div>
                  <Input
                    id="event-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an event cover image (JPG, PNG, or GIF)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventImagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={eventImagePreview}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {eventImageFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {eventImageFile.name} ({(eventImageFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveEventImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove & Choose Another
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Tech Workshop: Introduction to AI"
                value={createEventFormData.title}
                onChange={(e) => setCreateEventFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="event-description">Description *</Label>
              <Textarea
                id="event-description"
                placeholder="Describe what your event is about, what attendees will learn or experience..."
                value={createEventFormData.description}
                onChange={(e) => setCreateEventFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={createEventFormData.date}
                  onChange={(e) => setCreateEventFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-time">Time *</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={createEventFormData.time}
                  onChange={(e) => setCreateEventFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="event-location">Location *</Label>
              <Input
                id="event-location"
                placeholder="e.g., Engineering Building Room 203"
                value={createEventFormData.location}
                onChange={(e) => setCreateEventFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Category and Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-category">Category *</Label>
                <Select
                  value={createEventFormData.category}
                  onValueChange={(value) => setCreateEventFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="event-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-capacity">Capacity (optional)</Label>
                <Input
                  id="event-capacity"
                  type="number"
                  placeholder="e.g., 50"
                  value={createEventFormData.capacity}
                  onChange={(e) => setCreateEventFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={
                !createEventFormData.title ||
                !createEventFormData.description ||
                !createEventFormData.date ||
                !createEventFormData.time ||
                !createEventFormData.location ||
                !createEventFormData.category
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details below to modify your event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Event Image */}
            <div className="space-y-2">
              <Label>Event Image</Label>
              {!editEventImageFile && !editEventImagePreview ? (
                <div>
                  <Input
                    id="edit-event-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleEditEventImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an event cover image (JPG, PNG, or GIF)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editEventImagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={editEventImagePreview}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {editEventImageFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {editEventImageFile.name} ({(editEventImageFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveEditEventImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove & Choose Another
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">Event Title *</Label>
              <Input
                id="edit-event-title"
                placeholder="e.g., Tech Workshop: Introduction to AI"
                value={editEventFormData.title}
                onChange={(e) => setEditEventFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-event-description">Description *</Label>
              <Textarea
                id="edit-event-description"
                placeholder="Describe what your event is about, what attendees will learn or experience..."
                value={editEventFormData.description}
                onChange={(e) => setEditEventFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-date">Date *</Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={editEventFormData.date}
                  onChange={(e) => setEditEventFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-time">Time *</Label>
                <Input
                  id="edit-event-time"
                  type="time"
                  value={editEventFormData.time}
                  onChange={(e) => setEditEventFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="edit-event-location">Location *</Label>
              <Input
                id="edit-event-location"
                placeholder="e.g., Engineering Building Room 203"
                value={editEventFormData.location}
                onChange={(e) => setEditEventFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Category and Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-category">Category *</Label>
                <Select
                  value={editEventFormData.category}
                  onValueChange={(value) => setEditEventFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="edit-event-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-capacity">Capacity (optional)</Label>
                <Input
                  id="edit-event-capacity"
                  type="number"
                  placeholder="e.g., 50"
                  value={editEventFormData.capacity}
                  onChange={(e) => setEditEventFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedEvent}
              disabled={
                !editEventFormData.title ||
                !editEventFormData.description ||
                !editEventFormData.date ||
                !editEventFormData.time ||
                !editEventFormData.location ||
                !editEventFormData.category
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteMemberDialogOpen} onOpenChange={setIsInviteMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="student@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="invite-role">Initial Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="President">President</SelectItem>
                  <SelectItem value="Vice President">Vice President</SelectItem>
                  <SelectItem value="Event Manager">Event Manager</SelectItem>
                  <SelectItem value="Content Editor">Content Editor</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Information Note */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                An email invitation will be sent to this address with a link to join your organization.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsInviteMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail || !inviteEmail.includes('@')}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={isCreatePostDialogOpen} onOpenChange={setIsCreatePostDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share updates, announcements, and news with your organization members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Post Title */}
            <div className="space-y-2">
              <Label htmlFor="create-post-title">Post Title *</Label>
              <Input
                id="create-post-title"
                placeholder="e.g., Hackathon 2025 Registration Open"
                value={createPostFormData.title}
                onChange={(e) => setCreatePostFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <Label htmlFor="create-post-content">Content *</Label>
              <Textarea
                id="create-post-content"
                placeholder="Write your post content here..."
                rows={6}
                value={createPostFormData.content}
                onChange={(e) => setCreatePostFormData(prev => ({ ...prev, content: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed information about your announcement, event, or news
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="create-post-category">Category *</Label>
              <Select
                value={createPostFormData.category}
                onValueChange={(value) => setCreatePostFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="create-post-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {profileType === "student" ? (
                    <>
                      <SelectItem value="Study">Study</SelectItem>
                      <SelectItem value="Collaboration">Collaboration</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Question">Question</SelectItem>
                      <SelectItem value="Opportunity">Opportunity</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Announcement">Announcement</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Opportunity">Opportunity</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="create-post-image">Cover Image (optional)</Label>
              {!imagePreview ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="create-post-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadedImage?.name} ({(uploadedImage!.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload an image to make your post more engaging
              </p>
            </div>

            {/* Preview Section */}
            {(createPostFormData.title || createPostFormData.content) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {createPostFormData.imageUrl && (
                      <ImageWithFallback
                        src={createPostFormData.imageUrl}
                        alt="Post preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {createPostFormData.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {createPostFormData.category}
                        </Badge>
                      )}
                      {createPostFormData.title && (
                        <h3 className="font-semibold mb-2">{createPostFormData.title}</h3>
                      )}
                      {createPostFormData.content && (
                        <p className="text-sm text-muted-foreground">
                          {createPostFormData.content}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreatePostDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={profileType === "student" ? handleCreateStudentPost : handleCreatePost}
              disabled={
                !createPostFormData.title ||
                !createPostFormData.content ||
                !createPostFormData.category
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditPostDialogOpen} onOpenChange={setIsEditPostDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post information and content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Post Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-post-title">Post Title *</Label>
              <Input
                id="edit-post-title"
                placeholder="e.g., Hackathon 2025 Registration Open"
                value={editPostFormData.title}
                onChange={(e) => setEditPostFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <Label htmlFor="edit-post-content">Content *</Label>
              <Textarea
                id="edit-post-content"
                placeholder="Write your post content here..."
                rows={6}
                value={editPostFormData.content}
                onChange={(e) => setEditPostFormData(prev => ({ ...prev, content: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed information about your announcement, event, or news
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-post-category">Category *</Label>
              <Select
                value={editPostFormData.category}
                onValueChange={(value) => setEditPostFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="edit-post-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {profileType === "student" ? (
                    <>
                      <SelectItem value="Study">Study</SelectItem>
                      <SelectItem value="Collaboration">Collaboration</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Question">Question</SelectItem>
                      <SelectItem value="Opportunity">Opportunity</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Announcement">Announcement</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Opportunity">Opportunity</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="edit-post-image">Cover Image (optional)</Label>
              {!editImagePreview ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-post-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveEditImage}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  {uploadedEditImage && (
                    <p className="text-xs text-muted-foreground">
                      {uploadedEditImage.name} ({(uploadedEditImage.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload an image to make your post more engaging
              </p>
            </div>

            {/* Preview Section */}
            {(editPostFormData.title || editPostFormData.content) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {editPostFormData.imageUrl && (
                      <ImageWithFallback
                        src={editPostFormData.imageUrl}
                        alt="Post preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {editPostFormData.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {editPostFormData.category}
                        </Badge>
                      )}
                      {editPostFormData.title && (
                        <h3 className="font-semibold mb-2">{editPostFormData.title}</h3>
                      )}
                      {editPostFormData.content && (
                        <p className="text-sm text-muted-foreground">
                          {editPostFormData.content}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={profileType === "student" ? handleSaveEditedStudentPost : handleSaveEditedPost}
              disabled={
                !editPostFormData.title ||
                !editPostFormData.content ||
                !editPostFormData.category
              }
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Set up your new campus organization. Fill in the required information to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Organization Logo */}
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={orgLogoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(createOrgFormData.name || 'Org')}&background=random`} alt="Organization logo" />
                  <AvatarFallback>{createOrgFormData.name ? createOrgFormData.name[0] : 'O'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  {!orgLogoFile ? (
                    <div>
                      <Input
                        id="org-logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleOrgLogoUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload your organization's logo (JPG, PNG, or GIF)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {orgLogoFile.name} ({(orgLogoFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveOrgLogo}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove & Choose Another
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input
                  id="org-name"
                  placeholder="e.g., Tech Innovation Club"
                  value={createOrgFormData.name}
                  onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-category">Category *</Label>
                <Select
                  value={createOrgFormData.category}
                  onValueChange={(value) => setCreateOrgFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="org-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-description">Description *</Label>
                <Textarea
                  id="org-description"
                  placeholder="Brief description of your organization..."
                  value={createOrgFormData.description}
                  onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-mission">Mission Statement (optional)</Label>
                <Textarea
                  id="org-mission"
                  placeholder="Your organization's mission..."
                  value={createOrgFormData.mission}
                  onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, mission: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    placeholder="contact@organization.com"
                    value={createOrgFormData.email}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input
                    id="org-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={createOrgFormData.phone}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    type="url"
                    placeholder="https://yourorganization.com"
                    value={createOrgFormData.website}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Social Media
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-discord">Discord</Label>
                  <Input
                    id="org-discord"
                    placeholder="discord.gg/yourserver"
                    value={createOrgFormData.discord}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, discord: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-instagram">Instagram</Label>
                  <Input
                    id="org-instagram"
                    placeholder="@yourorganization"
                    value={createOrgFormData.instagram}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="org-linkedin">LinkedIn</Label>
                  <Input
                    id="org-linkedin"
                    placeholder="linkedin.com/company/yourorg"
                    value={createOrgFormData.linkedin}
                    onChange={(e) => setCreateOrgFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateOrgDialogOpen(false);
              setCreateOrgFormData({
                name: "",
                description: "",
                mission: "",
                category: "",
                email: "",
                phone: "",
                website: "",
                discord: "",
                instagram: "",
                linkedin: ""
              });
              setOrgLogoFile(null);
              setOrgLogoPreview("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={
                !createOrgFormData.name ||
                !createOrgFormData.category ||
                !createOrgFormData.description
              }
            >
              <Building2 className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}